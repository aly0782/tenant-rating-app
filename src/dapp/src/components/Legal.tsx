import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  List,
  ListItem,
  UnorderedList,
  OrderedList,
  Divider,
  Code,
  Card,
  CardBody,
  Alert,
  AlertIcon,
  Stack,
  Badge,
  useColorModeValue
} from '@chakra-ui/react';

const Legal: React.FC = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="container.lg">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack spacing={4} textAlign="center" mb={8}>
            <Heading as="h1" size="2xl" fontWeight="bold">
              REITx: Blockchain-Based Real Estate Investment Trust Platform
            </Heading>
            <Text fontSize="xl" color="gray.600">
              Legal and Technical Overview for Legal Professionals
            </Text>
          </VStack>

          {/* Executive Summary */}
          <Card>
            <CardBody>
              <Heading as="h2" size="lg" mb={4}>Executive Summary</Heading>
              <Text>
                REITx is a blockchain-based Real Estate Investment Trust (REIT) platform built on The Open Network (TON) blockchain. 
                It enables fractional ownership of real estate properties through tokenization, allowing investors to purchase and 
                trade property-backed digital tokens that represent partial ownership interests in real estate assets located in Portugal.
              </Text>
            </CardBody>
          </Card>

          {/* What is REITx */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading as="h2" size="lg">What is REITx?</Heading>
                <Text>
                  REITx is a decentralized application (dApp) that tokenizes real estate assets, converting physical properties into 
                  divisible digital tokens on the blockchain. Each token represents a fractional ownership stake in the underlying 
                  real estate asset, entitling token holders to proportional rights to rental income and property appreciation.
                </Text>
                
                <Box>
                  <Heading as="h3" size="md" mb={3}>Key Components:</Heading>
                  <OrderedList spacing={2}>
                    <ListItem>
                      <Text fontWeight="semibold" display="inline">Digital Tokens (REITx Tokens): </Text>
                      Fungible tokens representing fractional ownership in specific properties
                    </ListItem>
                    <ListItem>
                      <Text fontWeight="semibold" display="inline">Smart Contracts: </Text>
                      Self-executing contracts on the TON blockchain that govern token issuance, distribution, and revenue sharing
                    </ListItem>
                    <ListItem>
                      <Text fontWeight="semibold" display="inline">Property Portfolio: </Text>
                      Physical real estate assets in Portugal that serve as the underlying collateral
                    </ListItem>
                    <ListItem>
                      <Text fontWeight="semibold" display="inline">Distribution Mechanism: </Text>
                      Automated monthly yield distributions in TON cryptocurrency
                    </ListItem>
                  </OrderedList>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          {/* Why is REITx an On-Chain REIT */}
          <Card>
            <CardBody>
              <VStack spacing={6} align="stretch">
                <Heading as="h2" size="lg">Why is REITx an On-Chain REIT?</Heading>
                
                {/* Legal Structure Parallels */}
                <Box>
                  <Heading as="h3" size="md" mb={3}>1. Legal Structure Parallels to Traditional REITs</Heading>
                  <Text mb={3}>
                    REITx implements the fundamental characteristics of a Real Estate Investment Trust through blockchain technology:
                  </Text>
                  <UnorderedList spacing={2}>
                    <ListItem><Text fontWeight="semibold" display="inline">Asset Pooling:</Text> Properties are pooled and tokenized, similar to how traditional REITs pool real estate assets</ListItem>
                    <ListItem><Text fontWeight="semibold" display="inline">Fractional Ownership:</Text> Investors own tokens representing shares in the property, analogous to REIT shares</ListItem>
                    <ListItem><Text fontWeight="semibold" display="inline">Income Distribution:</Text> Regular distribution of rental income to token holders, meeting REIT-like distribution requirements</ListItem>
                    <ListItem><Text fontWeight="semibold" display="inline">Professional Management:</Text> Properties are professionally managed with revenues flowing to token holders</ListItem>
                    <ListItem><Text fontWeight="semibold" display="inline">Liquidity:</Text> Tokens can be traded on secondary markets, providing liquidity similar to publicly-traded REITs</ListItem>
                  </UnorderedList>
                </Box>

                {/* Blockchain Implementation Advantages */}
                <Box>
                  <Heading as="h3" size="md" mb={3}>2. Blockchain Implementation Advantages</Heading>
                  <Text mb={3}>The on-chain implementation provides several legal and operational benefits:</Text>
                  <UnorderedList spacing={2}>
                    <ListItem><Text fontWeight="semibold" display="inline">Immutable Ownership Records:</Text> All ownership transfers are recorded on the blockchain, creating an auditable, tamper-proof ledger</ListItem>
                    <ListItem><Text fontWeight="semibold" display="inline">Automated Compliance:</Text> Smart contracts enforce distribution rules and ownership restrictions automatically</ListItem>
                    <ListItem><Text fontWeight="semibold" display="inline">Transparent Operations:</Text> All transactions, distributions, and ownership changes are publicly verifiable</ListItem>
                    <ListItem><Text fontWeight="semibold" display="inline">Reduced Intermediaries:</Text> Direct peer-to-peer transactions reduce the need for traditional intermediaries</ListItem>
                    <ListItem><Text fontWeight="semibold" display="inline">Global Accessibility:</Text> Investors worldwide can participate, subject to local regulations</ListItem>
                  </UnorderedList>
                </Box>

                {/* Smart Contract Governance */}
                <Box>
                  <Heading as="h3" size="md" mb={3}>3. Smart Contract Governance</Heading>
                  <Text mb={3}>The platform utilizes smart contracts to implement REIT-like governance:</Text>
                  <Card variant="outline" bg={bgColor}>
                    <CardBody>
                      <Code display="block" whiteSpace="pre" p={4}>
{`REITxFactory Contract
├── Property Registration
├── Token Issuance (Minting)
├── Ownership Tracking
├── Revenue Distribution
└── Compliance Rules`}
                      </Code>
                    </CardBody>
                  </Card>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          {/* Legal Considerations */}
          <Card>
            <CardBody>
              <VStack spacing={6} align="stretch">
                <Heading as="h2" size="lg">Legal Considerations</Heading>
                
                {/* Securities Law Compliance */}
                <Box>
                  <Heading as="h3" size="md" mb={3}>1. Securities Law Compliance</Heading>
                  <Alert status="warning" mb={3}>
                    <AlertIcon />
                    <Text fontWeight="semibold">Important Note: REITx tokens may constitute securities under various jurisdictions' laws.</Text>
                  </Alert>
                  <Text mb={3}>Key considerations include:</Text>
                  <UnorderedList spacing={2}>
                    <ListItem><Text fontWeight="semibold" display="inline">Investment Contract Analysis:</Text> Under the Howey Test (US) and similar frameworks, tokens may be deemed securities</ListItem>
                    <ListItem><Text fontWeight="semibold" display="inline">Registration Requirements:</Text> May require registration or exemption under applicable securities laws</ListItem>
                    <ListItem><Text fontWeight="semibold" display="inline">Investor Accreditation:</Text> May need to restrict sales to accredited/qualified investors</ListItem>
                    <ListItem><Text fontWeight="semibold" display="inline">Cross-Border Regulations:</Text> Must comply with securities laws in all jurisdictions where tokens are offered</ListItem>
                  </UnorderedList>
                </Box>

                {/* Property Law Integration */}
                <Box>
                  <Heading as="h3" size="md" mb={3}>2. Property Law Integration</Heading>
                  <Text mb={3}>The platform must bridge blockchain ownership with traditional property law:</Text>
                  <UnorderedList spacing={2}>
                    <ListItem><Text fontWeight="semibold" display="inline">Legal Entity Structure:</Text> A legal entity (SPV/LLC) holds title to physical properties</ListItem>
                    <ListItem><Text fontWeight="semibold" display="inline">Token-to-Equity Mapping:</Text> Tokens represent beneficial interests in the legal entity</ListItem>
                    <ListItem><Text fontWeight="semibold" display="inline">Deed Registration:</Text> Physical properties remain registered under traditional land registry systems</ListItem>
                    <ListItem><Text fontWeight="semibold" display="inline">Rights Enforcement:</Text> Token holders' rights must be enforceable under applicable property law</ListItem>
                  </UnorderedList>
                </Box>

                {/* Tax Implications */}
                <Box>
                  <Heading as="h3" size="md" mb={3}>3. Tax Implications</Heading>
                  <Text mb={3}>REITx must address various tax considerations:</Text>
                  <UnorderedList spacing={2}>
                    <ListItem><Text fontWeight="semibold" display="inline">REIT Tax Treatment:</Text> May qualify for pass-through taxation if structured properly</ListItem>
                    <ListItem><Text fontWeight="semibold" display="inline">Withholding Requirements:</Text> International distributions may trigger withholding obligations</ListItem>
                    <ListItem><Text fontWeight="semibold" display="inline">Token Transaction Taxes:</Text> Sales/transfers may trigger capital gains or transaction taxes</ListItem>
                    <ListItem><Text fontWeight="semibold" display="inline">VAT/GST Considerations:</Text> Service fees and property transactions may trigger indirect taxes</ListItem>
                  </UnorderedList>
                </Box>

                {/* AML & KYC */}
                <Box>
                  <Heading as="h3" size="md" mb={3}>4. Anti-Money Laundering (AML) & Know Your Customer (KYC)</Heading>
                  <Text mb={3}>Compliance requirements include:</Text>
                  <UnorderedList spacing={2}>
                    <ListItem><Text fontWeight="semibold" display="inline">Identity Verification:</Text> KYC procedures for all token purchasers</ListItem>
                    <ListItem><Text fontWeight="semibold" display="inline">Transaction Monitoring:</Text> Ongoing monitoring for suspicious activities</ListItem>
                    <ListItem><Text fontWeight="semibold" display="inline">Reporting Obligations:</Text> SAR/STR filing requirements</ListItem>
                    <ListItem><Text fontWeight="semibold" display="inline">Sanctions Screening:</Text> Checking against prohibited persons lists</ListItem>
                  </UnorderedList>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          {/* Technical Architecture */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading as="h2" size="lg">Technical Architecture</Heading>
                
                <Box>
                  <Heading as="h3" size="md" mb={3}>1. Blockchain Layer (TON)</Heading>
                  <UnorderedList spacing={2}>
                    <ListItem>Decentralized ledger for recording all transactions</ListItem>
                    <ListItem>Smart contract execution environment</ListItem>
                    <ListItem>Consensus mechanism ensuring transaction validity</ListItem>
                  </UnorderedList>
                </Box>

                <Box>
                  <Heading as="h3" size="md" mb={3}>2. Smart Contract Layer</Heading>
                  <UnorderedList spacing={2}>
                    <ListItem><Text fontWeight="semibold" display="inline">REITxFactory:</Text> Main contract managing property tokenization</ListItem>
                    <ListItem><Text fontWeight="semibold" display="inline">Property Contracts:</Text> Individual contracts for each tokenized property</ListItem>
                    <ListItem><Text fontWeight="semibold" display="inline">Distribution Contracts:</Text> Automated yield distribution mechanisms</ListItem>
                  </UnorderedList>
                </Box>

                <Box>
                  <Heading as="h3" size="md" mb={3}>3. Application Layer</Heading>
                  <UnorderedList spacing={2}>
                    <ListItem>Web-based user interface for investors</ListItem>
                    <ListItem>Wallet integration (TON Connect)</ListItem>
                    <ListItem>Property browsing and investment tools</ListItem>
                    <ListItem>Dashboard for tracking investments and yields</ListItem>
                  </UnorderedList>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          {/* Regulatory Framework */}
          <Card>
            <CardBody>
              <VStack spacing={6} align="stretch">
                <Heading as="h2" size="lg">Regulatory Framework</Heading>
                
                <Box>
                  <Heading as="h3" size="md" mb={3}>1. European Union Regulations</Heading>
                  <UnorderedList spacing={2}>
                    <ListItem><Text fontWeight="semibold" display="inline">MiCA Regulation:</Text> Markets in Crypto-Assets Regulation compliance</ListItem>
                    <ListItem><Text fontWeight="semibold" display="inline">MiFID II:</Text> Potential application to token trading</ListItem>
                    <ListItem><Text fontWeight="semibold" display="inline">AIFMD:</Text> Alternative Investment Fund Managers Directive considerations</ListItem>
                    <ListItem><Text fontWeight="semibold" display="inline">5th/6th AML Directives:</Text> Anti-money laundering requirements</ListItem>
                  </UnorderedList>
                </Box>

                <Box>
                  <Heading as="h3" size="md" mb={3}>2. Portuguese Specific Requirements</Heading>
                  <UnorderedList spacing={2}>
                    <ListItem><Text fontWeight="semibold" display="inline">CMVM Oversight:</Text> Portuguese Securities Market Commission regulations</ListItem>
                    <ListItem><Text fontWeight="semibold" display="inline">Property Investment Laws:</Text> Compliance with local real estate investment regulations</ListItem>
                    <ListItem><Text fontWeight="semibold" display="inline">Tax Regime:</Text> Portuguese tax treatment of REITs and crypto assets</ListItem>
                  </UnorderedList>
                </Box>

                <Box>
                  <Heading as="h3" size="md" mb={3}>3. International Considerations</Heading>
                  <UnorderedList spacing={2}>
                    <ListItem><Text fontWeight="semibold" display="inline">Cross-border Offering Rules:</Text> Compliance with each jurisdiction's securities laws</ListItem>
                    <ListItem><Text fontWeight="semibold" display="inline">FATF Recommendations:</Text> International AML/CTF standards</ListItem>
                    <ListItem><Text fontWeight="semibold" display="inline">Tax Treaties:</Text> Application to cross-border distributions</ListItem>
                  </UnorderedList>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          {/* Risk Disclosure Framework */}
          <Card>
            <CardBody>
              <VStack spacing={6} align="stretch">
                <Heading as="h2" size="lg">Risk Disclosure Framework</Heading>
                
                <Box>
                  <Heading as="h3" size="md" mb={3}>Legal Risks:</Heading>
                  <OrderedList spacing={2}>
                    <ListItem><Text fontWeight="semibold" display="inline">Regulatory Uncertainty:</Text> Evolving blockchain and cryptocurrency regulations</ListItem>
                    <ListItem><Text fontWeight="semibold" display="inline">Enforcement Risk:</Text> Potential regulatory enforcement actions</ListItem>
                    <ListItem><Text fontWeight="semibold" display="inline">Cross-jurisdictional Complexity:</Text> Conflicting laws across jurisdictions</ListItem>
                    <ListItem><Text fontWeight="semibold" display="inline">Smart Contract Risk:</Text> Code vulnerabilities or unintended consequences</ListItem>
                  </OrderedList>
                </Box>

                <Box>
                  <Heading as="h3" size="md" mb={3}>Operational Risks:</Heading>
                  <OrderedList spacing={2}>
                    <ListItem><Text fontWeight="semibold" display="inline">Property Market Risk:</Text> Real estate value fluctuations</ListItem>
                    <ListItem><Text fontWeight="semibold" display="inline">Liquidity Risk:</Text> Secondary market liquidity for tokens</ListItem>
                    <ListItem><Text fontWeight="semibold" display="inline">Technology Risk:</Text> Blockchain network issues or failures</ListItem>
                    <ListItem><Text fontWeight="semibold" display="inline">Counterparty Risk:</Text> Property management and service provider risks</ListItem>
                  </OrderedList>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          {/* Compliance Implementation */}
          <Card>
            <CardBody>
              <VStack spacing={6} align="stretch">
                <Heading as="h2" size="lg">Compliance Implementation</Heading>
                
                <Box>
                  <Heading as="h3" size="md" mb={3}>1. Investor Onboarding Process</Heading>
                  <OrderedList spacing={2}>
                    <ListItem>Initial Registration</ListItem>
                    <ListItem>KYC/AML Verification</ListItem>
                    <ListItem>Investor Suitability Assessment</ListItem>
                    <ListItem>Regulatory Jurisdiction Determination</ListItem>
                    <ListItem>Investment Limits Application</ListItem>
                    <ListItem>Token Purchase Authorization</ListItem>
                  </OrderedList>
                </Box>

                <Box>
                  <Heading as="h3" size="md" mb={3}>2. Ongoing Compliance Monitoring</Heading>
                  <UnorderedList spacing={2}>
                    <ListItem>Transaction surveillance systems</ListItem>
                    <ListItem>Periodic KYC refresh</ListItem>
                    <ListItem>Regulatory reporting</ListItem>
                    <ListItem>Audit trail maintenance</ListItem>
                  </UnorderedList>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          {/* Legal Documentation Requirements */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading as="h2" size="lg">Legal Documentation Requirements</Heading>
                <Heading as="h3" size="md">Essential Documents:</Heading>
                <OrderedList spacing={2}>
                  <ListItem><Text fontWeight="semibold" display="inline">Token Purchase Agreement:</Text> Terms governing token sales</ListItem>
                  <ListItem><Text fontWeight="semibold" display="inline">Property Information Memorandum:</Text> Detailed property disclosures</ListItem>
                  <ListItem><Text fontWeight="semibold" display="inline">Smart Contract Audit Reports:</Text> Third-party security assessments</ListItem>
                  <ListItem><Text fontWeight="semibold" display="inline">Risk Disclosure Statement:</Text> Comprehensive risk warnings</ListItem>
                  <ListItem><Text fontWeight="semibold" display="inline">Terms of Service:</Text> Platform usage terms</ListItem>
                  <ListItem><Text fontWeight="semibold" display="inline">Privacy Policy:</Text> Data protection compliance</ListItem>
                  <ListItem><Text fontWeight="semibold" display="inline">Whitepaper:</Text> Technical and business model documentation</ListItem>
                </OrderedList>
              </VStack>
            </CardBody>
          </Card>

          {/* Conclusion */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading as="h2" size="lg">Conclusion</Heading>
                <Text>
                  REITx represents an innovative application of blockchain technology to traditional real estate investment structures. 
                  By tokenizing real estate assets on the TON blockchain, it creates a REIT-like investment vehicle that offers 
                  fractional ownership, regular income distributions, and enhanced liquidity.
                </Text>
                <Text>
                  However, the platform operates in a complex regulatory environment requiring careful navigation of securities laws, 
                  property regulations, tax requirements, and AML/KYC obligations across multiple jurisdictions. Legal counsel should 
                  ensure comprehensive compliance frameworks are in place before platform launch and maintain ongoing regulatory 
                  monitoring as the legal landscape evolves.
                </Text>
              </VStack>
            </CardBody>
          </Card>

          {/* Recommended Legal Actions */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading as="h2" size="lg">Recommended Legal Actions</Heading>
                <OrderedList spacing={2}>
                  <ListItem><Text fontWeight="semibold" display="inline">Obtain Legal Opinion:</Text> Secure formal legal opinions on token classification in target jurisdictions</ListItem>
                  <ListItem><Text fontWeight="semibold" display="inline">Regulatory Engagement:</Text> Proactively engage with regulators in primary markets</ListItem>
                  <ListItem><Text fontWeight="semibold" display="inline">Structure Optimization:</Text> Implement legal entity structures that optimize tax and regulatory treatment</ListItem>
                  <ListItem><Text fontWeight="semibold" display="inline">Documentation Review:</Text> Ensure all legal documentation meets regulatory standards</ListItem>
                  <ListItem><Text fontWeight="semibold" display="inline">Compliance Systems:</Text> Deploy robust KYC/AML and transaction monitoring systems</ListItem>
                  <ListItem><Text fontWeight="semibold" display="inline">Insurance Coverage:</Text> Obtain appropriate D&O, E&O, and cyber insurance policies</ListItem>
                </OrderedList>
              </VStack>
            </CardBody>
          </Card>

          {/* Disclaimer */}
          <Alert status="info" mt={8}>
            <AlertIcon />
            <Box>
              <Text fontWeight="semibold">Disclaimer</Text>
              <Text fontSize="sm">
                This document is for informational purposes only and does not constitute legal advice. 
                Specific legal counsel should be sought for implementation of any blockchain-based REIT structure.
              </Text>
              <Text fontSize="xs" mt={2} color="gray.600">
                Last Updated: August 2025 | Version: 1.0
              </Text>
            </Box>
          </Alert>
        </VStack>
      </Container>
    </Box>
  );
};

export default Legal;