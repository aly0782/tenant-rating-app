import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Grid,
  GridItem,
  VStack,
  HStack,
  Button,
  Badge,
  Image,
  Progress,
  Card,
  CardBody,
  CardHeader,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Divider,
  SimpleGrid,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Center
} from '@chakra-ui/react';
import { useTonConnect } from '../hooks/useTonConnect';
import { useREITxFactory } from '../hooks/useREITxFactory';
import { fromNano } from '@ton/core';

interface PropertyHoldingDisplay {
  id: number;
  name: string;
  location: string;
  tokensOwned: number;
  totalSupply: number;
  pricePerToken: string;
  monthlyRent: string;
  image: string;
  totalInvested: number;
  currentValue: number;
  monthlyYield: number;
  totalReturns: number;
  apy: number;
  ownershipPercentage: number;
}

interface MonthlyReturn {
  month: string;
  amount: number;
  propertyId: number;
  propertyName: string;
}

// Property images mapping - in production this could come from metadata or IPFS
const getPropertyImage = (propertyId: number, propertyName: string): string => {
  if (propertyName.toLowerCase().includes('patuá')) {
    return '/patua-pictures/IMG_4722.jpg';
  }
  if (propertyName.toLowerCase().includes('villa')) {
    return '/four-seasons-pictures/IMG_4823.jpg';
  }
  if (propertyName.toLowerCase().includes('sesimbra')) {
    return '/rua-barbadinhos-pictures/IMG_4840.jpg';
  }
  return '/patua-pictures/IMG_4722.jpg'; // Default image
};

export function InvestorDashboard() {
  const { isConnected, userAddress } = useTonConnect();
  const { getUserHoldings, isLoading: contractLoading, error: contractError } = useREITxFactory();
  const [holdings, setHoldings] = useState<PropertyHoldingDisplay[]>([]);
  const [monthlyReturns, setMonthlyReturns] = useState<MonthlyReturn[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserHoldings = async () => {
      if (!isConnected || !userAddress || contractLoading) {
        setIsLoading(false);
        return;
      }

      if (contractError) {
        console.error('Contract error:', contractError);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      try {
        const contractHoldings = await getUserHoldings();
        
        // Transform contract data to display format
        const displayHoldings: PropertyHoldingDisplay[] = contractHoldings.map((holding) => ({
          id: holding.propertyId,
          name: holding.propertyInfo.name,
          location: holding.propertyInfo.location,
          tokensOwned: Number(holding.userBalance),
          totalSupply: Number(holding.propertyInfo.totalSupply),
          pricePerToken: fromNano(holding.propertyInfo.pricePerToken),
          monthlyRent: fromNano(holding.propertyInfo.monthlyRent),
          image: getPropertyImage(holding.propertyId, holding.propertyInfo.name),
          totalInvested: Number(fromNano(holding.userInvestment)),
          currentValue: Number(fromNano(holding.currentValue)),
          monthlyYield: Number(fromNano(holding.monthlyYield)),
          totalReturns: Number(fromNano(holding.totalReturns)),
          ownershipPercentage: holding.ownershipPercentage,
          apy: holding.propertyInfo.monthlyRent > 0n ? 
            Number(holding.propertyInfo.monthlyRent * 12n * 100n / holding.userInvestment) / 100 : 0,
        }));
        
        setHoldings(displayHoldings);
        
        // Generate monthly returns history based on holdings
        const returns: MonthlyReturn[] = [];
        const monthsBack = 6;
        for (let i = 0; i < monthsBack; i++) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
          
          const totalMonthlyYield = displayHoldings.reduce((sum, holding) => sum + holding.monthlyYield, 0);
          
          if (totalMonthlyYield > 0) {
            returns.push({
              month: monthKey,
              amount: totalMonthlyYield,
              propertyId: 0, // Combined from all properties
              propertyName: displayHoldings.length > 1 ? 'All Properties' : displayHoldings[0]?.name || 'Properties'
            });
          }
        }
        
        setMonthlyReturns(returns);
      } catch (error) {
        console.error('Failed to fetch holdings:', error);
      }
      
      setIsLoading(false);
    };

    fetchUserHoldings();
  }, [isConnected, userAddress, contractLoading, contractError, getUserHoldings]);

  const calculatePortfolioStats = () => {
    const totalInvested = holdings.reduce((sum, holding) => sum + holding.totalInvested, 0);
    const currentValue = holdings.reduce((sum, holding) => sum + holding.currentValue, 0);
    const totalReturns = holdings.reduce((sum, holding) => sum + holding.totalReturns, 0);
    const monthlyYield = holdings.reduce((sum, holding) => sum + holding.monthlyYield, 0);
    const portfolioReturn = totalInvested > 0 ? ((currentValue - totalInvested) / totalInvested) * 100 : 0;
    
    return {
      totalInvested,
      currentValue,
      totalReturns,
      monthlyYield,
      portfolioReturn,
      totalProperties: holdings.length
    };
  };

  const portfolioStats = calculatePortfolioStats();

  if (contractError) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={6} mb={8}>
          <Heading size="2xl" fontWeight="bold">Investor Dashboard</Heading>
          <Text color="neutral.600" fontSize="lg">Track your REITx property investments and returns</Text>
        </VStack>

        <Alert
          status="warning"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          height="200px"
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            Contract Not Available
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            {contractError}
          </AlertDescription>
        </Alert>
      </Container>
    );
  }

  if (!isConnected) {
    return (
      <Container maxW="container.xl" py={8}>
        <Center h="60vh">
          <VStack spacing={6} textAlign="center">
            <Heading size="lg" color="neutral.600">Connect Your TON Wallet</Heading>
            <Text color="neutral.500" fontSize="lg">
              Please connect your TON wallet to view your REITx property portfolio and returns.
            </Text>
          </VStack>
        </Center>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Center h="60vh">
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" thickness="3px" />
            <Text color="neutral.600">Loading your portfolio...</Text>
          </VStack>
        </Center>
      </Container>
    );
  }

  if (holdings.length === 0) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={6} mb={8}>
          <Heading size="2xl" fontWeight="bold">Investor Dashboard</Heading>
          <Text color="neutral.600" fontSize="lg">Track your REITx property investments and returns</Text>
        </VStack>

        <Alert
          status="info"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          height="200px"
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            No Properties Found
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            You haven't invested in any REITx properties yet. Start building your real estate portfolio by browsing our available properties.
          </AlertDescription>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} mb={8}>
        <Heading size="2xl" fontWeight="bold">Investor Dashboard</Heading>
        <Text color="neutral.600" fontSize="lg">Track your REITx property investments and returns</Text>
      </VStack>

      {/* Portfolio Overview Stats */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={6} mb={12}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total Invested</StatLabel>
              <StatNumber color="blue.600">€{portfolioStats.totalInvested.toLocaleString()}</StatNumber>
              <StatHelpText>{portfolioStats.totalProperties} properties</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Current Value</StatLabel>
              <StatNumber color="green.600">€{portfolioStats.currentValue.toLocaleString()}</StatNumber>
              <StatHelpText>
                <StatArrow type={portfolioStats.portfolioReturn >= 0 ? 'increase' : 'decrease'} />
                {Math.abs(portfolioStats.portfolioReturn).toFixed(2)}%
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Monthly Yield</StatLabel>
              <StatNumber color="purple.600">€{portfolioStats.monthlyYield.toFixed(2)}</StatNumber>
              <StatHelpText>Expected monthly income</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total Returns</StatLabel>
              <StatNumber color="orange.600">€{portfolioStats.totalReturns.toFixed(2)}</StatNumber>
              <StatHelpText>All-time earnings</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </Grid>

      {/* Property Holdings */}
      <Box mb={12}>
        <Heading size="lg" mb={6}>Your Property Holdings</Heading>
        <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
          {holdings.map((holding) => (
            <Card key={holding.id} overflow="hidden">
              <CardHeader pb={0}>
                <HStack spacing={4}>
                  <Image
                    src={holding.image}
                    alt={holding.name}
                    w={20}
                    h={16}
                    objectFit="cover"
                    borderRadius="md"
                  />
                  <VStack align="flex-start" spacing={1} flex={1}>
                    <Heading size="md" lineHeight="short">
                      {holding.name}
                    </Heading>
                    <Text color="neutral.600" fontSize="sm">
                      {holding.location}
                    </Text>
                    <Badge colorScheme="blue" size="sm">
                      {holding.ownershipPercentage.toFixed(2)}% ownership
                    </Badge>
                  </VStack>
                </HStack>
              </CardHeader>

              <CardBody>
                <SimpleGrid columns={2} spacing={4} mb={4}>
                  <VStack align="flex-start" spacing={1}>
                    <Text fontSize="xs" color="neutral.500" textTransform="uppercase">Tokens Owned</Text>
                    <Text fontWeight="bold" fontSize="lg">{holding.tokensOwned.toLocaleString()}</Text>
                  </VStack>
                  <VStack align="flex-start" spacing={1}>
                    <Text fontSize="xs" color="neutral.500" textTransform="uppercase">Investment</Text>
                    <Text fontWeight="bold" fontSize="lg">€{holding.totalInvested.toLocaleString()}</Text>
                  </VStack>
                  <VStack align="flex-start" spacing={1}>
                    <Text fontSize="xs" color="neutral.500" textTransform="uppercase">Current Value</Text>
                    <Text fontWeight="bold" fontSize="lg" color="green.600">
                      €{holding.currentValue.toLocaleString()}
                    </Text>
                  </VStack>
                  <VStack align="flex-start" spacing={1}>
                    <Text fontSize="xs" color="neutral.500" textTransform="uppercase">Monthly Yield</Text>
                    <Text fontWeight="bold" fontSize="lg" color="purple.600">
                      €{holding.monthlyYield.toFixed(2)}
                    </Text>
                  </VStack>
                </SimpleGrid>

                <Divider mb={4} />

                <VStack align="flex-start" spacing={2}>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" color="neutral.600">Performance</Text>
                    <Text fontSize="sm" fontWeight="bold" color="green.600">
                      +{((holding.currentValue - holding.totalInvested) / holding.totalInvested * 100).toFixed(2)}%
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="neutral.500">
                    APY: {holding.apy.toFixed(1)}% • Total Returns: €{holding.totalReturns.toFixed(2)}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </Grid>
      </Box>

      {/* Monthly Returns History */}
      <Box>
        <Heading size="lg" mb={6}>Monthly Returns History</Heading>
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {monthlyReturns.map((returnData, index) => (
                <Box key={index}>
                  <HStack justify="space-between" align="center">
                    <VStack align="flex-start" spacing={1}>
                      <Text fontWeight="bold">
                        {new Date(returnData.month + '-01').toLocaleDateString('en-US', { 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </Text>
                      <Text fontSize="sm" color="neutral.600">
                        {returnData.propertyName}
                      </Text>
                    </VStack>
                    <VStack align="flex-end" spacing={1}>
                      <Text fontWeight="bold" color="green.600" fontSize="lg">
                        +€{returnData.amount.toFixed(2)}
                      </Text>
                      <Badge colorScheme="green" size="sm">Received</Badge>
                    </VStack>
                  </HStack>
                  {index < monthlyReturns.length - 1 && <Divider mt={4} />}
                </Box>
              ))}
            </VStack>
          </CardBody>
        </Card>
      </Box>
    </Container>
  );
}