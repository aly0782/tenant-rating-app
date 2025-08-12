import { Box, Container, Heading, Text, VStack, UnorderedList, ListItem, Alert, AlertIcon, Divider } from "@chakra-ui/react";
import React from "react";

const RiskDisclosure: React.FC = () => {
  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading as="h1" size="2xl" mb={2}>
            Risk Disclosure & Legal Compliance
          </Heading>
        </Box>

        <Alert status="warning" borderRadius="lg">
          <AlertIcon />
          <Text>
            This document contains important information about the legal framework and risks associated with REITx. 
            Please read carefully before participating.
          </Text>
        </Alert>

        <Box>
          <Heading as="h2" size="xl" mb={4} color="gray.700">
            Legal Compliance
          </Heading>
          <Box bg="gray.50" p={6} borderRadius="lg" borderLeft="4px solid" borderLeftColor="blue.500">
            <Text mb={4}>
              REITx operates under Portuguese crowdfunding regulations, specifically <strong>Law No. 102/2015</strong>, 
              and adheres to AML guidelines as outlined by the Bank of Portugal. All users must complete full 
              identity verification (KYC) before participating.
            </Text>
          </Box>
        </Box>

        <Box>
          <Heading as="h2" size="xl" mb={4} color="gray.700">
            Investor Rights
          </Heading>
          <Box bg="blue.50" p={6} borderRadius="lg">
            <UnorderedList spacing={3} pl={4}>
              <ListItem>
                <Text><strong>Tokens represent revenue-sharing rights only</strong></Text>
                <Text fontSize="sm" color="gray.600" mt={1}>
                  Your tokens entitle you to a proportional share of rental income, not property ownership
                </Text>
              </ListItem>
              <ListItem>
                <Text><strong>No ownership of property or SPV equity is granted</strong></Text>
                <Text fontSize="sm" color="gray.600" mt={1}>
                  Token holders do not receive equity stakes or voting rights in property management decisions
                </Text>
              </ListItem>
              <ListItem>
                <Text><strong>Smart contracts govern all payouts and access</strong></Text>
                <Text fontSize="sm" color="gray.600" mt={1}>
                  All distributions and token mechanics are automated and transparent through blockchain technology
                </Text>
              </ListItem>
            </UnorderedList>
          </Box>
        </Box>

        <Box>
          <Heading as="h2" size="xl" mb={4} color="gray.700">
            Risks
          </Heading>
          <Box bg="red.50" p={6} borderRadius="lg" borderLeft="4px solid" borderLeftColor="red.500">
            <UnorderedList spacing={4} pl={4}>
              <ListItem>
                <Text fontWeight="semibold">Property Income Variability</Text>
                <Text fontSize="sm" color="gray.700" mt={1}>
                  Property income may vary based on tenant performance and market conditions. Rental yields can 
                  fluctuate due to vacancy periods, tenant defaults, or changes in local real estate markets.
                </Text>
              </ListItem>
              <ListItem>
                <Text fontWeight="semibold">No Guaranteed Returns</Text>
                <Text fontSize="sm" color="gray.700" mt={1}>
                  Income is tied to real-world business activity. There are no guaranteed minimum returns, and 
                  past performance does not indicate future results.
                </Text>
              </ListItem>
              <ListItem>
                <Text fontWeight="semibold">Force Majeure Events</Text>
                <Text fontSize="sm" color="gray.700" mt={1}>
                  Natural disasters, force majeure, or legal changes may affect payouts. Events beyond our control 
                  could impact property operations and income distribution.
                </Text>
              </ListItem>
            </UnorderedList>
          </Box>
        </Box>

        <Box>
          <Heading as="h2" size="xl" mb={4} color="gray.700">
            Disclosures
          </Heading>
          <Box bg="green.50" p={6} borderRadius="lg">
            <UnorderedList spacing={3} pl={4}>
              <ListItem>
                <Text><strong>All contracts are public and auditable</strong></Text>
                <Text fontSize="sm" color="gray.600" mt={1}>
                  Smart contract code is open-source and can be verified on the blockchain
                </Text>
              </ListItem>
              <ListItem>
                <Text><strong>Yield history and reporting available on your dashboard</strong></Text>
                <Text fontSize="sm" color="gray.600" mt={1}>
                  Track your returns, payment history, and portfolio performance in real-time
                </Text>
              </ListItem>
              <ListItem>
                <Text><strong>Insurance is maintained for critical infrastructure and operations</strong></Text>
                <Text fontSize="sm" color="gray.600" mt={1}>
                  Properties are insured against major risks, though insurance may not cover all potential losses
                </Text>
              </ListItem>
            </UnorderedList>
          </Box>
        </Box>

        <Divider />

        <Box>
          <Heading as="h2" size="lg" mb={4} color="gray.700">
            Additional Important Information
          </Heading>
          <VStack spacing={4} align="stretch">
            <Box p={4} bg="yellow.50" borderRadius="md" borderLeft="3px solid" borderLeftColor="yellow.500">
              <Text fontWeight="semibold" mb={2}>Tax Obligations</Text>
              <Text fontSize="sm">
                Token holders are responsible for their own tax obligations. Rental income distributions may be 
                subject to taxation in your jurisdiction. Consult with a tax professional for guidance.
              </Text>
            </Box>

            <Box p={4} bg="purple.50" borderRadius="md" borderLeft="3px solid" borderLeftColor="purple.500">
              <Text fontWeight="semibold" mb={2}>Liquidity Considerations</Text>
              <Text fontSize="sm">
                While tokens can be traded on secondary markets when available, liquidity is not guaranteed. 
                Market conditions may affect your ability to sell tokens at desired prices.
              </Text>
            </Box>

            <Box p={4} bg="gray.100" borderRadius="md" borderLeft="3px solid" borderLeftColor="gray.500">
              <Text fontWeight="semibold" mb={2}>Regulatory Changes</Text>
              <Text fontSize="sm">
                Cryptocurrency and real estate tokenization regulations are evolving. Future regulatory changes 
                may impact token functionality, trading, or income distribution mechanisms.
              </Text>
            </Box>
          </VStack>
        </Box>

        <Alert status="info" borderRadius="lg">
          <AlertIcon />
          <Box>
            <Text fontWeight="bold" mb={1}>Investment Disclaimer</Text>
            <Text fontSize="sm">
              This information does not constitute financial, investment, or legal advice. REITx tokens are not 
              suitable for all investors. You should carefully consider your investment objectives, risk tolerance, 
              and consult with professional advisors before participating. Past performance is not indicative of 
              future results.
            </Text>
          </Box>
        </Alert>

        <Box textAlign="center" pt={4}>
          <Text color="gray.500" fontSize="sm">
            Last updated: January 2025 | REITx Platform v1.0
          </Text>
        </Box>
      </VStack>
    </Container>
  );
};

export default RiskDisclosure;