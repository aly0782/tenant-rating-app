import { Box, Container, Heading, Text, VStack, UnorderedList, ListItem, OrderedList, Link, Divider } from "@chakra-ui/react";
import React from "react";

const Whitepaper: React.FC = () => {
  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading as="h1" size="2xl" mb={2}>
            REITx: Whitepaper v1.0
          </Heading>
        </Box>

        <Box>
          <Heading as="h2" size="xl" mb={4}>
            1. Executive Summary
          </Heading>
          <Text mb={3}>
            REITx is a blockchain-powered real estate investment platform that lets anyone co-own high-yielding properties from as little as €100. We tokenize income-producing assets like restaurants, retail spaces, and apartments, enabling real yield to be distributed monthly to token holders in ETH or USDC.
          </Text>
          <Text>
            Our first asset is a Lisbon-based Macanese restaurant named Patuá, currently operating and generating fixed monthly rent, providing a yield of up to 16% annually.
          </Text>
        </Box>

        <Box>
          <Heading as="h2" size="xl" mb={4}>
            2. Vision
          </Heading>
          <Text fontStyle="italic" fontSize="lg" mb={3}>
            "To make real estate investing accessible, transparent, and borderless."
          </Text>
          <Text mb={3}>
            Traditional real estate investing is expensive, slow, and exclusive. REITx removes these barriers by offering:
          </Text>
          <UnorderedList spacing={2} pl={6}>
            <ListItem>Fractional ownership</ListItem>
            <ListItem>Crypto-native yield</ListItem>
            <ListItem>On-chain transparency</ListItem>
            <ListItem>Low capital entry point</ListItem>
          </UnorderedList>
        </Box>

        <Box>
          <Heading as="h2" size="xl" mb={4}>
            3. How REITx Works
          </Heading>
          <OrderedList spacing={3} pl={6}>
            <ListItem>Browse curated, high-potential properties vetted by experts.</ListItem>
            <ListItem>Invest from just €100 using ETH or USDC.</ListItem>
            <ListItem>Earn monthly yield from rental income.</ListItem>
            <ListItem>Track your portfolio and earnings via the REITx dashboard.</ListItem>
          </OrderedList>
          <Text mt={3}>
            All transactions, income, and token data are recorded on-chain.
          </Text>
        </Box>

        <Box>
          <Heading as="h2" size="xl" mb={4}>
            4. The Token Model
          </Heading>
          
          <Heading as="h3" size="lg" mb={3}>
            A. Property-Specific Tokens (PST)
          </Heading>
          <UnorderedList spacing={2} pl={6} mb={4}>
            <ListItem>Each property has its own token (e.g., REX-001).</ListItem>
            <ListItem>Tokens entitle holders to a share of net rental revenue.</ListItem>
            <ListItem>No equity or real estate ownership is granted; revenue-share rights only.</ListItem>
          </UnorderedList>

          <Heading as="h3" size="lg" mb={3}>
            B. Yield Tier Incentives
          </Heading>
          <Box overflowX="auto" mb={4}>
            <Box as="table" width="100%" borderWidth="1px" borderRadius="lg">
              <Box as="thead" bg="gray.50">
                <Box as="tr">
                  <Box as="th" p={3} borderBottomWidth="1px" textAlign="left">Holding Period</Box>
                  <Box as="th" p={3} borderBottomWidth="1px" textAlign="left">Monthly Yield Estimate</Box>
                  <Box as="th" p={3} borderBottomWidth="1px" textAlign="left">Annual Yield (APY)</Box>
                </Box>
              </Box>
              <Box as="tbody">
                <Box as="tr">
                  <Box as="td" p={3} borderBottomWidth="1px">Month 1–2</Box>
                  <Box as="td" p={3} borderBottomWidth="1px">€1.00 per token</Box>
                  <Box as="td" p={3} borderBottomWidth="1px">~12%</Box>
                </Box>
                <Box as="tr">
                  <Box as="td" p={3} borderBottomWidth="1px">Month 3–5</Box>
                  <Box as="td" p={3} borderBottomWidth="1px">€1.16 per token</Box>
                  <Box as="td" p={3} borderBottomWidth="1px">~14%</Box>
                </Box>
                <Box as="tr">
                  <Box as="td" p={3}>Month 6+</Box>
                  <Box as="td" p={3}>€1.33 per token</Box>
                  <Box as="td" p={3}>~16%</Box>
                </Box>
              </Box>
            </Box>
          </Box>
          <Text mb={4}>
            Holding longer = higher returns. Selling resets the tier.
          </Text>

          <Heading as="h3" size="lg" mb={3}>
            C. Future Portfolio Token (Optional)
          </Heading>
          <UnorderedList spacing={2} pl={6}>
            <ListItem>Pools multiple property revenues</ListItem>
            <ListItem>Auto-balances across locations</ListItem>
            <ListItem>DAO governance potential</ListItem>
          </UnorderedList>
        </Box>

        <Box>
          <Heading as="h2" size="xl" mb={4}>
            5. Legal & Compliance
          </Heading>
          <UnorderedList spacing={2} pl={6} mb={3}>
            <ListItem>REITx operates under Portuguese Law No. 102/2015 (Crowdfunding)</ListItem>
            <ListItem>All investors must pass KYC/AML in line with Bank of Portugal guidelines</ListItem>
            <ListItem>Tokens represent revenue rights only, not securities or equity</ListItem>
            <ListItem>Each asset is held by an SPV (Special Purpose Vehicle)</ListItem>
            <ListItem>Smart contracts are auditable and control all payouts</ListItem>
          </UnorderedList>
          <Text fontStyle="italic">
            "REITx is not a REIT. It is a crypto-native real estate income platform inspired by the REIT model."
          </Text>
        </Box>

        <Box>
          <Heading as="h2" size="xl" mb={4}>
            6. First Property – Case Study
          </Heading>
          <Box bg="gray.50" p={4} borderRadius="lg">
            <UnorderedList spacing={2}>
              <ListItem><strong>Name:</strong> Patuá Lisbon</ListItem>
              <ListItem><strong>Type:</strong> Macanese Restaurant</ListItem>
              <ListItem><strong>Capex:</strong> €150,000</ListItem>
              <ListItem><strong>Tokenized:</strong> €50,000</ListItem>
              <ListItem><strong>Rent Income:</strong> €2,000/month</ListItem>
              <ListItem><strong>Token Price:</strong> €100</ListItem>
              <ListItem><strong>APY:</strong> Up to 16%</ListItem>
            </UnorderedList>
            <Divider my={3} />
            <Text mb={2}>
              <strong>Token Holders:</strong> Receive monthly yield in ETH or USDC.
            </Text>
            <Text>
              <strong>Perks:</strong> Free meals, discounts, NFTs, governance access.
            </Text>
          </Box>
        </Box>

        <Box>
          <Heading as="h2" size="xl" mb={4}>
            7. Roadmap
          </Heading>
          
          <Box mb={4}>
            <Heading as="h3" size="lg" mb={2}>Q2 2025:</Heading>
            <UnorderedList spacing={1} pl={6}>
              <ListItem>Launch REITx+ Tokenize Patuá</ListItem>
              <ListItem>Start investor onboarding</ListItem>
              <ListItem>Distribute first yield</ListItem>
            </UnorderedList>
          </Box>

          <Box mb={4}>
            <Heading as="h3" size="lg" mb={2}>Q3 2025:</Heading>
            <UnorderedList spacing={1} pl={6}>
              <ListItem>Launch Property #2 (retail space or apartment)</ListItem>
              <ListItem>MVP dashboard & live yield tracking</ListItem>
            </UnorderedList>
          </Box>

          <Box mb={4}>
            <Heading as="h3" size="lg" mb={2}>Q4 2025:</Heading>
            <UnorderedList spacing={1} pl={6}>
              <ListItem>Secondary market concept design</ListItem>
              <ListItem>Prepare DAO governance logic</ListItem>
            </UnorderedList>
          </Box>

          <Box>
            <Heading as="h3" size="lg" mb={2}>2026:</Heading>
            <UnorderedList spacing={1} pl={6}>
              <ListItem>Portfolio Token launch (BPT)</ListItem>
              <ListItem>Expand to Spain or Brazil</ListItem>
            </UnorderedList>
          </Box>
        </Box>

        <Box>
          <Heading as="h2" size="xl" mb={4}>
            8. Risks & Disclaimers
          </Heading>
          <UnorderedList spacing={2} pl={6} mb={3}>
            <ListItem>Real estate value and rent can fluctuate</ListItem>
            <ListItem>Catastrophic events (natural disasters, legal changes) may impact revenue</ListItem>
            <ListItem>Tokens are not liquid assets (yet); resale coming soon</ListItem>
            <ListItem>Income is performance-based, not guaranteed</ListItem>
          </UnorderedList>
          <Text fontStyle="italic">
            Investing in REITx carries risks. Do your own research. This is not financial advice.
          </Text>
        </Box>

        <Box>
          <Heading as="h2" size="xl" mb={4}>
            9. Contact
          </Heading>
          <VStack align="start" spacing={2}>
            <Text>
              <strong>Website:</strong> <Link href="https://www.REITx.finance" isExternal color="blue.500">www.REITx.finance</Link>
            </Text>
            <Text>
              <strong>Email:</strong> <Link href="mailto:founders@REITx.finance" color="blue.500">founders@REITx.finance</Link>
            </Text>
            <Text>
              <strong>Lisbon HQ</strong>
            </Text>
          </VStack>
        </Box>

        <Divider />

        <Box textAlign="center" py={4}>
          <Text fontSize="lg" fontWeight="bold" color="gray.600">
            REITx: Own a slice of the world. Brick by brick.
          </Text>
        </Box>
      </VStack>
    </Container>
  );
};

export default Whitepaper;