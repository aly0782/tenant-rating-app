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
  SimpleGrid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  Card,
  CardBody,
  CardFooter,
  CardHeader
} from '@chakra-ui/react';
import { useTonConnect } from '../hooks/useTonConnect';
import { useREITxFactory } from '../hooks/useREITxFactory';
import { toNano, fromNano } from '@ton/core';

interface Property {
  id: number;
  name: string;
  location: string;
  totalSupply: string;
  pricePerToken: string;
  monthlyRent: string;
  active: boolean;
  uri: string;
  availableTokens: string;
  images: string[];
  description: string;
}

const properties: Property[] = [
  {
    id: 0,
    name: 'Patuá — Lisbon Restaurant',
    location: 'Anjos, Lisbon, Portugal',
    totalSupply: '2000', // 2000 tokens at €50 each = €100,000 total
    pricePerToken: '50', // €50 per token
    monthlyRent: '2000', // €2,000 monthly return for investors
    active: true,
    uri: 'https://REITx.ton/properties/patua',
    availableTokens: '2000', // All tokens available - connect to actual contract for real data
    images: [
      '/patua-pictures/IMG_4722.jpg',
      '/patua-pictures/IMG_4724.jpg',
      '/patua-pictures/IMG_4920.jpg',
    ],
    description: "Nestled in Lisbon's energetic Anjos neighborhood, Patuá is a fully operational restaurant serving rare and authentic Macanese cuisine, a beautiful blend of Portuguese and Asian influences. This property is FUNDED and operational, currently generating €2,000 monthly returns. Additional tokens available for new investors.",
  },
  // {
  //   id: 1,
  //   name: 'Lisbon 4 Bedroom Villa',
  //   location: 'Graça, Lisbon, Portugal',
  //   totalSupply: '20000',
  //   pricePerToken: '150',
  //   monthlyRent: '12000',
  //   active: true,
  //   uri: 'https://REITx.ton/properties/graca',
  //   availableTokens: '15000',
  //   images: [
  //     '/four-seasons-pictures/IMG_4823.jpg',
  //     '/four-seasons-pictures/IMG_4824.jpg',
  //     '/four-seasons-pictures/IMG_4828.jpg',
  //   ],
  //   description: "A central-Lisbon retreat. This renovation project will turn this home in the traditional Graça neighborhood into a luxury urban retreat, with a backyard, a pool, 4 bedrooms, and 4 bathrooms.",
  // },
  // {
  //   id: 2,
  //   name: 'Sesimbra Holiday Home',
  //   location: 'Sesimbra, Portugal',
  //   totalSupply: '5000',
  //   pricePerToken: '80',
  //   monthlyRent: '3500',
  //   active: true,
  //   uri: 'https://REITx.ton/properties/sesimbra',
  //   availableTokens: '4200',
  //   images: [
  //     '/rua-barbadinhos-pictures/IMG_4840.jpg',
  //     '/rua-barbadinhos-pictures/IMG_4841.jpg',
  //     '/rua-barbadinhos-pictures/IMG_4842.jpg',
  //   ],
  //   description: "This modern holiday home is part of a hotel in sunny Sesimbra. With less than an hour from Lisbon, and next to the Arrabida hills, this spot is the ultimate summer getaway.",
  // },
];

export function REITxPropertiesChakra() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [purchaseAmount, setPurchaseAmount] = useState<string>('1');
  const { isConnected, sendTransaction, userAddress } = useTonConnect();
  const { factory, isLoading, error, getAllProperties, buyTokens } = useREITxFactory();
  const [contractProperties, setContractProperties] = useState<any[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);

  // Load properties from contract on component mount
  useEffect(() => {
    const loadContractProperties = async () => {
      if (!factory) return;
      
      try {
        setLoadingProperties(true);
        const props = await getAllProperties();
        setContractProperties(props);
      } catch (err) {
        console.error('Failed to load properties:', err);
      } finally {
        setLoadingProperties(false);
      }
    };

    loadContractProperties();
  }, [factory, getAllProperties]);

  const calculateFundingProgress = (property: Property) => {
    const sold = Number(property.totalSupply) - Number(property.availableTokens);
    const percentage = (sold / Number(property.totalSupply)) * 100;
    return {
      percentage: Math.round(percentage),
      raised: sold,
      target: Number(property.totalSupply),
    };
  };

  const calculateAPY = (property: Property) => {
    const monthlyRent = Number(property.monthlyRent);
    const totalInvestment = Number(property.totalSupply) * Number(property.pricePerToken);
    const annualRent = monthlyRent * 12;
    const apy = (annualRent / totalInvestment) * 100;
    return apy.toFixed(2);
  };

  const handleViewDetails = (property: Property) => {
    setSelectedProperty(property);
    onOpen();
  };

  const handlePurchase = async () => {
    if (!selectedProperty || !isConnected || !factory) return;
    
    const amount = BigInt(purchaseAmount);
    const pricePerToken = toNano(selectedProperty.pricePerToken); // Convert EUR to nanotons for contract
    const totalCost = amount * pricePerToken;
    
    try {
      console.log('Initiating transaction for property:', selectedProperty.name);
      console.log('User address:', userAddress);
      console.log('Amount:', amount.toString(), 'Cost:', fromNano(totalCost));
      
      // Use the contract integration
      const txData = await buyTokens(selectedProperty.id, amount, pricePerToken);
      
      await sendTransaction({
        messages: [
          {
            address: factory.address.toString(),
            amount: txData.value.toString(),
            payload: '', // The contract method payload would be generated here
          },
        ],
        validUntil: Math.floor(Date.now() / 1000) + 300, // 5 minutes
      });
      
      alert(`Purchase ${amount} tokens for €${Number(purchaseAmount) * Number(selectedProperty.pricePerToken)} initiated successfully!`);
      onClose();
      
      // Reload properties to update available tokens
      const props = await getAllProperties();
      setContractProperties(props);
    } catch (error) {
      console.error('Transaction failed:', error);
      alert('Transaction failed. Please try again.');
    }
  };

  return (
    <Box py={16} bg="neutral.50">
      <Container maxW="container.xl">
        <VStack spacing={8} mb={16} textAlign="center">
          <Heading size="2xl" fontWeight="bold">
            Available Properties on TON
          </Heading>
          <Text fontSize="xl" color="neutral.600" maxW="container.md">
            Invest in premium Portuguese real estate through blockchain tokenization. 
            Own fractions, earn monthly yields in TON cryptocurrency.
          </Text>
        </VStack>

        {error && (
          <Box bg="red.50" p={4} borderRadius="md" mb={8}>
            <Text color="red.600">Contract Error: {error}</Text>
            <Text fontSize="sm" color="red.500" mt={2}>
              Using mock data for demonstration. Deploy the REITx Factory contract to see live data.
            </Text>
          </Box>
        )}
        
        {loadingProperties ? (
          <Box textAlign="center" py={16}>
            <Text fontSize="lg" color="neutral.600">Loading properties from blockchain...</Text>
          </Box>
        ) : (
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={8}>
            {(contractProperties.length > 0 ? contractProperties : properties).map((property, index) => {
              // For contract properties, map to our Property interface
              const displayProperty: Property = contractProperties.length > 0 ? {
                id: property.id || index,
                name: 'Patuá — Lisbon Restaurant', // Use hardcoded name for now
                location: 'Anjos, Lisbon, Portugal',
                totalSupply: property.totalSupply ? property.totalSupply.toString() : '2000',
                pricePerToken: property.pricePerToken ? fromNano(property.pricePerToken) : '50',
                monthlyRent: property.monthlyRent ? fromNano(property.monthlyRent) : '2000',
                active: true,
                uri: property.uri || 'https://REITx.ton/properties/patua',
                availableTokens: property.availableTokens ? property.availableTokens.toString() : '2000',
                images: [
                  '/patua-pictures/IMG_4722.jpg',
                  '/patua-pictures/IMG_4724.jpg',
                  '/patua-pictures/IMG_4920.jpg',
                ],
                description: "Nestled in Lisbon's energetic Anjos neighborhood, Patuá is a fully operational restaurant serving rare and authentic Macanese cuisine, a beautiful blend of Portuguese and Asian influences. This property is FUNDED and operational, currently generating €2,000 monthly returns. All tokens available for new investors.",
              } : property;
              
              const fundingProgress = calculateFundingProgress(displayProperty);
              const apy = calculateAPY(displayProperty);

              return (
                <Card key={displayProperty.id} overflow="hidden" _hover={{ transform: 'translateY(-4px)', shadow: 'xl' }} transition="all 0.3s">
                <Box position="relative" h="250px">
                  <Image
                    src={displayProperty.images[0]}
                    alt={displayProperty.name}
                    w="full"
                    h="full"
                    objectFit="cover"
                  />
                  <Badge
                    position="absolute"
                    top={4}
                    left={4}
                    colorScheme={displayProperty.active ? 'green' : 'red'}
                  >
                    {displayProperty.active ? 'OPERATIONAL' : 'Inactive'}
                  </Badge>
                </Box>

                <CardBody>
                  <VStack align="flex-start" spacing={4}>
                    <VStack align="flex-start" spacing={1}>
                      <Heading size="md" lineHeight="short">
                        {displayProperty.name}
                      </Heading>
                      <Text color="neutral.600" fontSize="sm">
                        {displayProperty.location}
                      </Text>
                      <Text fontSize="sm" color="neutral.500" noOfLines={3}>
                        {displayProperty.description}
                      </Text>
                    </VStack>

                    <SimpleGrid columns={2} spacing={4} w="full">
                      <Stat size="sm">
                        <StatLabel fontSize="xs">Price per Token</StatLabel>
                        <StatNumber fontSize="lg" color="blue.600">
                          €{displayProperty.pricePerToken}
                        </StatNumber>
                      </Stat>
                      <Stat size="sm">
                        <StatLabel fontSize="xs">Monthly Return</StatLabel>
                        <StatNumber fontSize="lg" color="green.600">
                          €{displayProperty.monthlyRent}
                        </StatNumber>
                      </Stat>
                    </SimpleGrid>

                    <Box w="full">
                      <HStack justify="space-between" mb={2}>
                        <Text fontSize="sm" color="neutral.600">
                          Funding Progress
                        </Text>
                        <Text fontSize="sm" fontWeight="bold">
                          {fundingProgress.percentage}%
                        </Text>
                      </HStack>
                      <Progress 
                        value={fundingProgress.percentage} 
                        size="sm" 
                        colorScheme="blue"
                        borderRadius="full"
                      />
                      <Text fontSize="xs" color="neutral.500" mt={1}>
                        {fundingProgress.raised.toLocaleString()} / {fundingProgress.target.toLocaleString()} tokens sold
                      </Text>
                    </Box>
                  </VStack>
                </CardBody>

                <CardFooter>
                  <Button
                    w="full"
                    colorScheme="blue"
                    onClick={() => handleViewDetails(displayProperty)}
                  >
                    View Details & Invest
                  </Button>
                </CardFooter>
                </Card>
              );
            })}
          </Grid>
        )}
      </Container>

      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedProperty?.name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedProperty && (
              <VStack spacing={6} align="stretch">
                <Grid templateColumns="repeat(3, 1fr)" gap={2}>
                  {selectedProperty.images.map((img, idx) => (
                    <Image
                      key={idx}
                      src={img}
                      alt={`Property ${idx + 1}`}
                      h="120px"
                      w="full"
                      objectFit="cover"
                      borderRadius="md"
                    />
                  ))}
                </Grid>

                <Text color="neutral.700">
                  {selectedProperty.description}
                </Text>

                <Divider />

                <SimpleGrid columns={2} spacing={4}>
                  <Stat>
                    <StatLabel>Location</StatLabel>
                    <StatNumber fontSize="md">{selectedProperty.location}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Total Supply</StatLabel>
                    <StatNumber fontSize="md">{Number(selectedProperty.totalSupply).toLocaleString()} tokens</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Available</StatLabel>
                    <StatNumber fontSize="md">{Number(selectedProperty.availableTokens).toLocaleString()} tokens</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Monthly Returns</StatLabel>
                    <StatNumber fontSize="md">€{selectedProperty.monthlyRent}</StatNumber>
                  </Stat>
                </SimpleGrid>

                <Divider />

                <VStack align="stretch" spacing={4}>
                  <FormControl>
                    <FormLabel>Number of Tokens to Purchase</FormLabel>
                    <Input
                      type="number"
                      min="1"
                      max={selectedProperty.availableTokens}
                      value={purchaseAmount}
                      onChange={(e) => setPurchaseAmount(e.target.value)}
                    />
                  </FormControl>

                  <Box p={4} bg="blue.50" borderRadius="md">
                    <SimpleGrid columns={2} spacing={4}>
                      <VStack align="flex-start" spacing={1}>
                        <Text fontSize="sm" color="neutral.600">Total Cost</Text>
                        <Text fontSize="lg" fontWeight="bold">
                          €{(Number(purchaseAmount) * Number(selectedProperty.pricePerToken)).toLocaleString()}
                        </Text>
                      </VStack>
                      <VStack align="flex-start" spacing={1}>
                        <Text fontSize="sm" color="neutral.600">Expected Monthly Yield</Text>
                        <Text fontSize="lg" fontWeight="bold" color="green.600">
                          €{((Number(purchaseAmount) / Number(selectedProperty.totalSupply)) * 
                            Number(selectedProperty.monthlyRent)).toFixed(2)}
                        </Text>
                      </VStack>
                    </SimpleGrid>
                  </Box>

                  <Button
                    colorScheme="blue"
                    size="lg"
                    onClick={handlePurchase}
                    disabled={!isConnected}
                  >
                    {isConnected ? 'Confirm Purchase' : 'Connect TON Wallet to Purchase'}
                  </Button>
                </VStack>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}