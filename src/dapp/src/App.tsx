import { Box, ChakraProvider, Container, Flex, Grid, GridItem, Heading, Text, VStack, Button, Image } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { ConnectButton } from "./components/ConnectButton";
import Footer from "./components/Footer";
import BodyRoot from "./BodyRoot";
import NetworkBadge from "./components/NetBadge";
import Whitepaper from "./components/Whitepaper";
import RiskDisclosure from "./components/RiskDisclosure";
import Legal from "./components/Legal";
import { REITxPropertiesChakra } from "./components/REITxPropertiesChakra";
import { InvestorDashboard } from "./components/InvestorDashboard";
import { modernTheme } from "./utils/theme";
import { THEME, useTonConnectUI, useTonAddress } from "@tonconnect/ui-react";

function App() {
  const [isGetMethods, setIsGetMethods] = useState(false);
  const [isWhitepaperRoute, setIsWhitepaperRoute] = useState(false);
  const [isRiskDisclosureRoute, setIsRiskDisclosureRoute] = useState(false);
  const [isDashboardRoute, setIsDashboardRoute] = useState(false);
  const [isLegalRoute, setIsLegalRoute] = useState(false);
  const [pathParams, setPathParams] = useState<{
    wrapper?: string;
    method?: string;
    address?: string;
  } | null>(null);
  const [tcUI, setTcUIOptions] = useTonConnectUI();
  const tonAddress = useTonAddress();

  // Navigation function
  const navigateTo = (route: string) => {
    const url = new URL(window.location.href);
    url.pathname = `/${route}`;
    window.history.pushState({}, '', url.toString());
    window.location.reload();
  };

  const handleGetStarted = async () => {
    if (!tonAddress) {
      await tcUI.connectWallet();
    } else {
      // Navigate to properties or dashboard when wallet is connected
      // For now, just scroll to properties section
      const propertiesSection = document.querySelector('.properties-section');
      if (propertiesSection) {
        propertiesSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const navigateHome = () => {
    const url = new URL(window.location.href);
    url.pathname = '/';
    window.history.pushState({}, '', url.toString());
    window.location.reload();
  };

  useEffect(() => {
    tcUI.connector.restoreConnection();
    setTcUIOptions({
      uiPreferences: {
        theme: THEME.LIGHT,
        borderRadius: "none",
        colorsSet: {
          [THEME.LIGHT]: {
            accent: "#000000",
          },
        },
      },
    });

    const origUrl = new URL(window.location.href);

    let base = import.meta.env.VITE_PUBLIC_URL || origUrl.origin;

    if (!base.includes(origUrl.origin)) {
      base = origUrl.origin + base;
    }

    const urlStringNoBase = window.location.href.replace(base, origUrl.origin);
    const urlToParse = new URL(urlStringNoBase);
    const pathParts = urlToParse.pathname.split("/").filter((part) => part !== "");

    // Check if this is the whitepaper route
    if (pathParts[0] === "whitepaper") {
      setIsWhitepaperRoute(true);
      return;
    }
    
    // Check if this is the risk-disclosure route
    if (pathParts[0] === "risk-disclosure") {
      setIsRiskDisclosureRoute(true);
      return;
    }
    
    // Check if this is the dashboard route
    if (pathParts[0] === "dashboard") {
      setIsDashboardRoute(true);
      return;
    }
    
    // Check if this is the legal route
    if (pathParts[0] === "legal") {
      setIsLegalRoute(true);
      return;
    }

    let providedWrapperFromPath: string | undefined;
    let providedMethodFromPath: string | undefined;
    let providedAddressFromPath: string | undefined;
    if (pathParts.length > 0) {
      [providedWrapperFromPath, providedMethodFromPath, providedAddressFromPath] = pathParts.slice(0, 3);
    } else {
      const params = new URLSearchParams(urlToParse.search);
      if ((providedWrapperFromPath = params.get("wrapper") || undefined)) {
        if ((providedMethodFromPath = params.get("method") || undefined)) {
          providedAddressFromPath = params.get("address") || undefined;
        }
      }
    }
    setPathParams({
      wrapper: providedWrapperFromPath,
      method: providedMethodFromPath,
      address: providedAddressFromPath,
    });

    if (providedMethodFromPath?.startsWith("get")) setIsGetMethods(true);
  }, []);

  return (
    <ChakraProvider theme={modernTheme}>
      <NetworkBadge />
      <Box bg="neutral.50" minH="100vh">
        {/* Navigation Header */}
        <Box
          as="nav"
          bg="white"
          borderBottom="1px solid"
          borderColor="neutral.200"
          position="sticky"
          top="0"
          zIndex="999"
          backdropFilter="blur(10px)"
          bgColor="rgba(255, 255, 255, 0.95)"
          h={{ base: "80px", md: "auto" }}
        >
          <Container maxW="container.xl" py={{ base: 3, md: 4 }} h="full">
            <Flex align="center" justify="space-between" h="full">
              <Flex align="center" gap={{ base: 4, md: 8 }}>
                <Heading 
                  size={{ base: "md", md: "lg" }}
                  fontWeight="bold" 
                  letterSpacing="tight"
                  cursor="pointer"
                  onClick={navigateHome}
                  _hover={{ color: "blue.600" }}
                >
                  {import.meta.env.VITE_REACT_APP_TITLE || "REITx"}
                </Heading>
                <Flex gap={6} display={{ base: "none", md: "flex" }}>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    fontWeight="medium"
                    onClick={navigateHome}
                    bg={!isWhitepaperRoute && !isRiskDisclosureRoute && !isDashboardRoute && !pathParams?.wrapper ? "gray.100" : "transparent"}
                  >
                    Home
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    fontWeight="medium"
                    onClick={() => {
                      if (window.location.pathname === '/') {
                        const propertiesSection = document.querySelector('.properties-section');
                        if (propertiesSection) {
                          propertiesSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      } else {
                        navigateHome();
                        setTimeout(() => {
                          const propertiesSection = document.querySelector('.properties-section');
                          if (propertiesSection) {
                            propertiesSection.scrollIntoView({ behavior: 'smooth' });
                          }
                        }, 100);
                      }
                    }}
                  >
                    Properties
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    fontWeight="medium"
                    onClick={() => navigateTo('dashboard')}
                    bg={isDashboardRoute ? "gray.100" : "transparent"}
                  >
                    Dashboard
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    fontWeight="medium" 
                    onClick={() => navigateTo('whitepaper')}
                    bg={isWhitepaperRoute ? "gray.100" : "transparent"}
                  >
                    Whitepaper
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    fontWeight="medium" 
                    onClick={() => navigateTo('risk-disclosure')}
                    bg={isRiskDisclosureRoute ? "gray.100" : "transparent"}
                  >
                    Risk Disclosure
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    fontWeight="medium" 
                    onClick={() => navigateTo('legal')}
                    bg={isLegalRoute ? "gray.100" : "transparent"}
                  >
                    Legal
                  </Button>
                </Flex>
              </Flex>
              <ConnectButton />
            </Flex>
          </Container>
        </Box>

        {/* Hero Section */}
        {!isWhitepaperRoute && !isRiskDisclosureRoute && !isDashboardRoute && !isLegalRoute && !pathParams?.wrapper && (
          <Box
            position="relative"
            h={{ base: "calc(100vh - 80px)", md: "70vh" }}
            bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            overflow="hidden"
          >
            <Box
              position="absolute"
              inset="0"
              bgImage="url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3')"
              bgSize="cover"
              bgPosition="center"
              opacity="0.3"
            />
            <Container maxW="container.xl" h="full" position="relative" px={{ base: 4, md: 8 }}>
              <VStack
                justify="center"
                h="full"
                align="flex-start"
                spacing={{ base: 4, md: 6 }}
                maxW={{ base: "100%", md: "60%" }}
                py={{ base: 6, md: 0 }}
              >
                <Heading
                  size={{ base: "xl", md: "3xl", lg: "4xl" }}
                  color="white"
                  fontWeight="bold"
                  lineHeight="shorter"
                >
                  Real Estate Investment on TON Blockchain
                </Heading>
                <Text fontSize={{ base: "md", md: "xl" }} color="whiteAlpha.900" lineHeight={{ base: "base", md: "tall" }}>
                  Invest in tokenized Lisbon properties through TON blockchain. 
                  Own fractions of real estate and earn monthly yields in TON.
                </Text>
                <Flex gap={{ base: 3, md: 4 }} flexWrap="wrap" w={{ base: "full", md: "auto" }}>
                  <Button 
                    size={{ base: "md", md: "lg" }}
                    variant="solid" 
                    bg="white" 
                    color="black" 
                    _hover={{ bg: "gray.100" }}
                    onClick={handleGetStarted}
                    flex={{ base: 1, md: "initial" }}
                    minW={{ base: "120px", md: "auto" }}
                  >
                    {tonAddress ? "View Properties" : "Get Started"}
                  </Button>
                  <Button 
                    size={{ base: "md", md: "lg" }}
                    variant="outline" 
                    color="white" 
                    borderColor="white" 
                    _hover={{ bg: "whiteAlpha.200" }}
                    onClick={() => navigateTo('whitepaper')}
                    flex={{ base: 1, md: "initial" }}
                    minW={{ base: "120px", md: "auto" }}
                  >
                    Learn More
                  </Button>
                </Flex>
              </VStack>
            </Container>
          </Box>
        )}

        {/* Main Content */}
        <Container maxW="container.xl" py={{ base: 8, md: 16 }}>
          {isWhitepaperRoute ? (
            <Whitepaper />
          ) : isRiskDisclosureRoute ? (
            <RiskDisclosure />
          ) : isDashboardRoute ? (
            <InvestorDashboard />
          ) : isLegalRoute ? (
            <Legal />
          ) : pathParams?.wrapper ? (
            <Grid templateColumns={{ base: "1fr", lg: "1fr" }} gap={8}>
              <GridItem>
                <BodyRoot
                  areGetMethods={isGetMethods}
                  setIsGetMethods={setIsGetMethods}
                  wrapperFromUrl={pathParams.wrapper}
                  methodFromUrl={pathParams.method}
                  addressFromUrl={pathParams.address}
                />
              </GridItem>
            </Grid>
          ) : (
            <>
              {/* REITx Properties Section */}
              <Box className="properties-section">
                <REITxPropertiesChakra />
              </Box>
              
              {/* Feature Grid */}
              <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={8} mt={16}>
                <GridItem>
                  <VStack
                    p={8}
                    bg="white"
                    border="1px solid"
                    borderColor="neutral.200"
                    align="flex-start"
                    spacing={4}
                    h="full"
                    transition="all 0.3s"
                    _hover={{ boxShadow: "lg", transform: "translateY(-4px)" }}
                  >
                    <Box w={12} h={12} bg="blue.600" borderRadius="md" />
                    <Heading size="md">Fractional Ownership</Heading>
                    <Text color="neutral.600">
                      Own a piece of premium Lisbon real estate with as little as 100 TON. 
                      Diversify your portfolio across multiple tokenized properties.
                    </Text>
                  </VStack>
                </GridItem>
                <GridItem>
                  <VStack
                    p={8}
                    bg="white"
                    border="1px solid"
                    borderColor="neutral.200"
                    align="flex-start"
                    spacing={4}
                    h="full"
                    transition="all 0.3s"
                    _hover={{ boxShadow: "lg", transform: "translateY(-4px)" }}
                  >
                    <Box w={12} h={12} bg="green.600" borderRadius="md" />
                    <Heading size="md">Monthly TON Yields</Heading>
                    <Text color="neutral.600">
                      Earn passive income from rental payments and revenue sharing, 
                      paid monthly in TON directly to your wallet.
                    </Text>
                  </VStack>
                </GridItem>
                <GridItem>
                  <VStack
                    p={8}
                    bg="white"
                    border="1px solid"
                    borderColor="neutral.200"
                    align="flex-start"
                    spacing={4}
                    h="full"
                    transition="all 0.3s"
                    _hover={{ boxShadow: "lg", transform: "translateY(-4px)" }}
                  >
                    <Box w={12} h={12} bg="purple.600" borderRadius="md" />
                    <Heading size="md">Blockchain Transparency</Heading>
                    <Text color="neutral.600">
                      Track ownership, rental income, and property performance in real-time. 
                      All transactions secured on the TON blockchain.
                    </Text>
                  </VStack>
                </GridItem>
              </Grid>
            </>
          )}
        </Container>

        <Footer />
      </Box>
    </ChakraProvider>
  );
}

export default App;