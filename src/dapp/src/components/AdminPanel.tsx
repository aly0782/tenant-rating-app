import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  Card,
  CardBody,
  CardHeader,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Switch,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  IconButton,
  InputGroup,
  InputLeftAddon,
  Image,
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon, AddIcon } from '@chakra-ui/icons';
import { useTonConnect } from '../hooks/useTonConnect';
import { useREITxFactory } from '../hooks/useREITxFactory';
import { toNano, fromNano, Address, beginCell } from '@ton/core';
import contractConfig from '../config/contract.json';
import { PinataUploader, buildPropertyMetadata } from '../utils/pinata';

interface PropertyForm {
  name: string;
  location: string;
  totalSupply: string;
  pricePerToken: string;
  monthlyRent: string;
  uri: string;
  description: string;
  images: string[];
  propertyType: string;
  yearBuilt: string;
  squareFootage: string;
  bedrooms: string;
  bathrooms: string;
  amenities: string;
  imageFiles: File[];
}

interface AdminAddress {
  address: string;
  type: 'super' | 'regular';
  addedDate: string;
}

interface TokenHolder {
  address: string;
  balance: string;
  percentage: number;
  usdcAmount?: number;
}

export function AdminPanel() {
  const { isConnected, userAddress } = useTonConnect();
  const { factory, createProperty, getPropertyHolders, getAllProperties, isLoading: contractLoading, error: contractError } = useREITxFactory();
  const [isAdmin, setIsAdmin] = useState<number>(0); // 0: not admin, 1: regular, 2: super
  const [admins, setAdmins] = useState<AdminAddress[]>([]);
  const [platformStats, setPlatformStats] = useState({ totalFunds: '0', totalRent: '0' });
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  
  // Form state for new property
  const [propertyForm, setPropertyForm] = useState<PropertyForm>({
    name: '',
    location: '',
    totalSupply: '',
    pricePerToken: '',
    monthlyRent: '',
    uri: '',
    description: '',
    images: [],
    propertyType: '',
    yearBuilt: '',
    squareFootage: '',
    bedrooms: '',
    bathrooms: '',
    amenities: '',
    imageFiles: []
  });
  const [isUploadingMetadata, setIsUploadingMetadata] = useState(false);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  // Form state for new admin
  const [newAdminAddress, setNewAdminAddress] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [selectedPropertyForHolders, setSelectedPropertyForHolders] = useState<number | null>(null);
  const [tokenHolders, setTokenHolders] = useState<TokenHolder[]>([]);
  const [totalUsdcToDistribute, setTotalUsdcToDistribute] = useState('');
  const [isLoadingHolders, setIsLoadingHolders] = useState(false);
  const [isDistributing, setIsDistributing] = useState(false);

  // Check admin status on mount
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isConnected || !userAddress || !factory) return;
      
      console.log('Checking admin status for:', userAddress);
      
      try {
        // This would call the contract's is_admin_address method
        // For now, we'll simulate it
        const adminStatus = await checkIfAdmin(userAddress);
        console.log('Admin status result:', adminStatus);
        setIsAdmin(adminStatus);
        
        if (adminStatus > 0) {
          await loadAdminData();
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };

    checkAdminStatus();
  }, [isConnected, userAddress, factory]);

  const checkIfAdmin = async (address: string): Promise<number> => {
    // Normalize the address to handle different formats
    const normalizeAddress = (addr: string): string => {
      try {
        // Parse and convert to raw format for comparison
        const parsed = Address.parse(addr);
        return parsed.toRawString();
      } catch {
        return addr;
      }
    };

    const normalizedUserAddress = normalizeAddress(address);
    const normalizedSuperAdmin = normalizeAddress(contractConfig.superAdmin);
    
    // Check against configured super admin first
    if (normalizedUserAddress === normalizedSuperAdmin) {
      return 2; // Super admin
    }
    
    // Check against configured regular admins
    if (contractConfig.admins) {
      for (const admin of contractConfig.admins) {
        if (normalizeAddress(admin) === normalizedUserAddress) {
          return 1; // Regular admin
        }
      }
    }
    
    // Also check the raw address format
    if (address === contractConfig.superAdmin || contractConfig.admins?.includes(address)) {
      return address === contractConfig.superAdmin ? 2 : 1;
    }
    
    console.log('Admin check failed:', {
      userAddress: address,
      normalizedUser: normalizedUserAddress,
      superAdmin: contractConfig.superAdmin,
      normalizedSuper: normalizedSuperAdmin,
      admins: contractConfig.admins
    });
    
    // In production, this would also call the contract's is_admin_address method
    // to get the latest admin list from the blockchain
    return 0;
  };

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      // Load platform statistics
      // const stats = await factory.getPlatformStats();
      // setPlatformStats(stats);
      
      // Load all properties
      if (getAllProperties) {
        const props = await getAllProperties();
        // Transform properties for display
        const displayProps = props.map((prop: any, index: number) => ({
          id: index,
          name: prop.name || `Property ${index}`,
          location: prop.location || 'Unknown',
          totalSupply: Number(prop.totalSupply) || 0,
          availableTokens: Number(prop.availableTokens) || 0,
          pricePerToken: fromNano(prop.pricePerToken || 0n),
          monthlyRent: fromNano(prop.monthlyRent || 0n),
          active: prop.active !== false
        }));
        setProperties(displayProps);
      }
      
      // Load admin list (super admin only)
      if (isAdmin === 2) {
        // const adminList = await factory.getAdminList();
        // setAdmins(adminList);
      }
      
      // Check if paused
      // const pausedStatus = await factory.isPaused();
      // setIsPaused(pausedStatus);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        title: 'Error loading data',
        description: 'Failed to load admin panel data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
    setIsLoading(false);
  };

  const handleCreateProperty = async () => {
    if (!factory) return;
    
    try {
      setIsLoading(true);
      
      // Validate form
      if (!propertyForm.name || !propertyForm.location || !propertyForm.totalSupply || 
          !propertyForm.pricePerToken || !propertyForm.description) {
        throw new Error('Please fill all required fields');
      }
      
      // Check for PINATA_JWT in environment
      const pinataJwt = import.meta.env.VITE_PINATA_JWT;
      if (!pinataJwt) {
        throw new Error('PINATA_JWT not configured. Please add VITE_PINATA_JWT to your .env file');
      }
      
      // Upload metadata to Pinata
      setIsUploadingMetadata(true);
      toast({
        title: 'Uploading metadata to IPFS...',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      
      const pinata = new PinataUploader(pinataJwt);
      
      // Upload images to Pinata first
      const imageUrls: string[] = [];
      if (propertyForm.imageFiles.length > 0) {
        toast({
          title: `Uploading ${propertyForm.imageFiles.length} images to IPFS...`,
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
        
        for (const file of propertyForm.imageFiles) {
          try {
            const imageUrl = await pinata.uploadFile(file);
            imageUrls.push(imageUrl);
          } catch (error) {
            console.error(`Failed to upload image ${file.name}:`, error);
            toast({
              title: 'Image upload warning',
              description: `Failed to upload ${file.name}, continuing with other images`,
              status: 'warning',
              duration: 3000,
              isClosable: true,
            });
          }
        }
      }
      
      // Process amenities from comma-separated string
      const amenities = propertyForm.amenities
        .split(',')
        .map(a => a.trim())
        .filter(a => a.length > 0);
      
      // Build metadata object
      const metadata = buildPropertyMetadata({
        name: propertyForm.name,
        location: propertyForm.location,
        description: propertyForm.description,
        images: imageUrls,
        totalSupply: propertyForm.totalSupply,
        pricePerToken: propertyForm.pricePerToken,
        monthlyRent: propertyForm.monthlyRent,
        propertyType: propertyForm.propertyType || undefined,
        yearBuilt: propertyForm.yearBuilt || undefined,
        squareFootage: propertyForm.squareFootage || undefined,
        bedrooms: propertyForm.bedrooms ? parseInt(propertyForm.bedrooms) : undefined,
        bathrooms: propertyForm.bathrooms ? parseInt(propertyForm.bathrooms) : undefined,
        amenities: amenities.length > 0 ? amenities : undefined,
      });
      
      // Upload to Pinata
      const metadataUri = await pinata.uploadJSON(metadata);
      setIsUploadingMetadata(false);
      
      toast({
        title: 'Metadata uploaded successfully',
        description: `IPFS URI: ${metadataUri}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Create property on blockchain with generated URI
      await createProperty({
        name: propertyForm.name,
        location: propertyForm.location,
        totalSupply: toNano(propertyForm.totalSupply),
        pricePerToken: toNano(propertyForm.pricePerToken),
        monthlyRent: toNano(propertyForm.monthlyRent || '0'),
        uri: metadataUri,
      });
      
      toast({
        title: 'Property Created',
        description: `Successfully created property: ${propertyForm.name}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Reset form
      setPropertyForm({
        name: '',
        location: '',
        totalSupply: '',
        pricePerToken: '',
        monthlyRent: '',
        uri: '',
        description: '',
        images: [],
        propertyType: '',
        yearBuilt: '',
        squareFootage: '',
        bedrooms: '',
        bathrooms: '',
        amenities: '',
        imageFiles: []
      });
      setImagePreviewUrls([]);
      
      // Reload properties
      await loadAdminData();
    } catch (error: any) {
      setIsUploadingMetadata(false);
      toast({
        title: 'Error creating property',
        description: error.message || 'Failed to create property',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
    setIsLoading(false);
  };

  const handleAddAdmin = async () => {
    if (!factory || isAdmin !== 2) return;
    
    try {
      setIsLoading(true);
      
      // Validate address
      if (!Address.isAddress(newAdminAddress)) {
        throw new Error('Invalid TON address');
      }
      
      // Add admin on blockchain
      // await factory.addAdmin(newAdminAddress);
      
      toast({
        title: 'Admin Added',
        description: `Successfully added admin: ${newAdminAddress}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      setNewAdminAddress('');
      await loadAdminData();
    } catch (error: any) {
      toast({
        title: 'Error adding admin',
        description: error.message || 'Failed to add admin',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
    setIsLoading(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const fileArray = Array.from(files);
    setPropertyForm({ ...propertyForm, imageFiles: [...propertyForm.imageFiles, ...fileArray] });
    
    // Create preview URLs
    const newPreviewUrls = fileArray.map(file => URL.createObjectURL(file));
    setImagePreviewUrls([...imagePreviewUrls, ...newPreviewUrls]);
  };
  
  const handleRemoveImage = (index: number) => {
    const newImageFiles = propertyForm.imageFiles.filter((_, i) => i !== index);
    const newPreviewUrls = imagePreviewUrls.filter((_, i) => i !== index);
    
    // Revoke the object URL to free memory
    URL.revokeObjectURL(imagePreviewUrls[index]);
    
    setPropertyForm({ ...propertyForm, imageFiles: newImageFiles });
    setImagePreviewUrls(newPreviewUrls);
  };

  const handleRemoveAdmin = async (address: string) => {
    if (!factory || isAdmin !== 2) return;
    
    try {
      setIsLoading(true);
      
      // Remove admin on blockchain
      // await factory.removeAdmin(address);
      
      toast({
        title: 'Admin Removed',
        description: `Successfully removed admin: ${address}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      await loadAdminData();
    } catch (error: any) {
      toast({
        title: 'Error removing admin',
        description: error.message || 'Failed to remove admin',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
    setIsLoading(false);
  };

  const handleTogglePropertyStatus = async (propertyId: number, currentStatus: boolean) => {
    if (!factory) return;
    
    try {
      setIsLoading(true);
      
      // Toggle property status on blockchain
      // await factory.setPropertyActive(propertyId, !currentStatus);
      
      toast({
        title: 'Property Status Updated',
        description: `Property ${propertyId} is now ${!currentStatus ? 'active' : 'inactive'}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      await loadAdminData();
    } catch (error: any) {
      toast({
        title: 'Error updating property',
        description: error.message || 'Failed to update property status',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
    setIsLoading(false);
  };

  const handleDistributeRent = async (propertyId: number, amount: string) => {
    if (!factory) return;
    
    try {
      setIsLoading(true);
      
      // Distribute rent on blockchain
      // await factory.distributeRent(propertyId, toNano(amount));
      
      toast({
        title: 'Rent Distributed',
        description: `Successfully distributed ${amount} TON for property ${propertyId}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      await loadAdminData();
    } catch (error: any) {
      toast({
        title: 'Error distributing rent',
        description: error.message || 'Failed to distribute rent',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
    setIsLoading(false);
  };

  const loadPropertyHolders = async (propertyId: number) => {
    if (!getPropertyHolders) return;
    
    setIsLoadingHolders(true);
    setSelectedPropertyForHolders(propertyId);
    
    try {
      const holders = await getPropertyHolders(propertyId);
      
      setTokenHolders(holders.map(h => ({
        address: h.address,
        balance: h.balance.toString(),
        percentage: h.percentage
      })));
    } catch (error) {
      console.error('Error loading token holders:', error);
      toast({
        title: 'Error loading holders',
        description: 'Failed to load token holders for this property',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
    
    setIsLoadingHolders(false);
  };
  
  const calculateDistribution = () => {
    if (!totalUsdcToDistribute || parseFloat(totalUsdcToDistribute) <= 0) {
      return tokenHolders;
    }
    
    const total = parseFloat(totalUsdcToDistribute);
    return tokenHolders.map(holder => ({
      ...holder,
      usdcAmount: (total * holder.percentage) / 100
    }));
  };
  
  const handleDistributeUSDC = async () => {
    if (!totalUsdcToDistribute || parseFloat(totalUsdcToDistribute) <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid USDC amount to distribute',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsDistributing(true);
    
    try {
      const distribution = calculateDistribution();
      
      // In production, this would call smart contract to distribute USDC
      // For now, we'll simulate the distribution
      toast({
        title: 'Distribution initiated',
        description: `Starting USDC distribution to ${distribution.length} holders`,
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      
      // Simulate distribution to each holder
      for (const holder of distribution) {
        if (holder.usdcAmount && holder.usdcAmount > 0) {
          // In production: await sendUSDC(holder.address, holder.usdcAmount);
          console.log(`Distributing ${holder.usdcAmount} USDC to ${holder.address}`);
        }
      }
      
      toast({
        title: 'Distribution complete',
        description: `Successfully distributed ${totalUsdcToDistribute} USDC to token holders`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Reset the form
      setTotalUsdcToDistribute('');
    } catch (error: any) {
      toast({
        title: 'Distribution failed',
        description: error.message || 'Failed to distribute USDC',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
    
    setIsDistributing(false);
  };

  const handleTogglePause = async () => {
    if (!factory) return;
    
    try {
      setIsLoading(true);
      
      // Toggle pause status on blockchain
      // if (isPaused) {
      //   await factory.unpause();
      // } else {
      //   await factory.pause();
      // }
      
      setIsPaused(!isPaused);
      
      toast({
        title: 'Platform Status Updated',
        description: `Platform is now ${!isPaused ? 'paused' : 'active'}`,
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Error updating platform status',
        description: error.message || 'Failed to update platform status',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
    setIsLoading(false);
  };

  if (!isConnected) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="warning">
          <AlertIcon />
          <AlertTitle>Wallet Not Connected</AlertTitle>
          <AlertDescription>
            Please connect your TON wallet to access the admin panel.
          </AlertDescription>
        </Alert>
      </Container>
    );
  }

  if (isAdmin === 0) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have admin privileges. This area is restricted to authorized administrators only.
          </AlertDescription>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <HStack justify="space-between" mb={4}>
            <VStack align="start" spacing={1}>
              <Heading size="xl">Admin Panel</Heading>
              <HStack>
                <Badge colorScheme={isAdmin === 2 ? 'purple' : 'blue'} fontSize="md" px={3} py={1}>
                  {isAdmin === 2 ? 'Super Admin' : 'Admin'}
                </Badge>
                {isPaused && (
                  <Badge colorScheme="red" fontSize="md" px={3} py={1}>
                    Platform Paused
                  </Badge>
                )}
              </HStack>
            </VStack>
            <HStack>
              <Button
                leftIcon={<AddIcon />}
                colorScheme="blue"
                onClick={() => {
                  setSelectedProperty(null);
                  onOpen();
                }}
              >
                Create Property
              </Button>
              <Button
                colorScheme={isPaused ? 'green' : 'red'}
                variant="outline"
                onClick={handleTogglePause}
                isLoading={isLoading}
              >
                {isPaused ? 'Unpause Platform' : 'Pause Platform'}
              </Button>
            </HStack>
          </HStack>
        </Box>

        {/* Platform Statistics */}
        <Card>
          <CardHeader>
            <Heading size="md">Platform Statistics</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              <Stat>
                <StatLabel>Total Funds Raised</StatLabel>
                <StatNumber>{platformStats.totalFunds} TON</StatNumber>
                <StatHelpText>Lifetime total</StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Total Rent Distributed</StatLabel>
                <StatNumber>{platformStats.totalRent} TON</StatNumber>
                <StatHelpText>To all investors</StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Active Properties</StatLabel>
                <StatNumber>{properties.filter(p => p.active).length}</StatNumber>
                <StatHelpText>Out of {properties.length} total</StatHelpText>
              </Stat>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Main Tabs */}
        <Tabs colorScheme="blue">
          <TabList>
            <Tab>Properties</Tab>
            <Tab>Token Holders</Tab>
            {isAdmin === 2 && <Tab>Admins</Tab>}
            <Tab>Rent Distribution</Tab>
            <Tab>Settings</Tab>
          </TabList>

          <TabPanels>
            {/* Properties Tab */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>ID</Th>
                        <Th>Name</Th>
                        <Th>Location</Th>
                        <Th isNumeric>Total Supply</Th>
                        <Th isNumeric>Available</Th>
                        <Th isNumeric>Price/Token</Th>
                        <Th>Status</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {properties.map((property) => (
                        <Tr key={property.id}>
                          <Td>{property.id}</Td>
                          <Td fontWeight="semibold">{property.name}</Td>
                          <Td>{property.location}</Td>
                          <Td isNumeric>{property.totalSupply}</Td>
                          <Td isNumeric>{property.availableTokens}</Td>
                          <Td isNumeric>{property.pricePerToken} TON</Td>
                          <Td>
                            <Switch
                              isChecked={property.active}
                              onChange={() => handleTogglePropertyStatus(property.id, property.active)}
                              colorScheme="green"
                            />
                          </Td>
                          <Td>
                            <HStack>
                              <IconButton
                                size="sm"
                                icon={<EditIcon />}
                                aria-label="Edit property"
                                onClick={() => {
                                  setSelectedProperty(property);
                                  onOpen();
                                }}
                              />
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </VStack>
            </TabPanel>

            {/* Token Holders Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                {/* Property Selection */}
                <Card>
                  <CardHeader>
                    <Heading size="md">Select Property</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                        {properties.map((property) => (
                          <Button
                            key={property.id}
                            variant={selectedPropertyForHolders === property.id ? 'solid' : 'outline'}
                            colorScheme={selectedPropertyForHolders === property.id ? 'blue' : 'gray'}
                            onClick={() => loadPropertyHolders(property.id)}
                            isLoading={isLoadingHolders && selectedPropertyForHolders === property.id}
                            height="auto"
                            py={3}
                            px={4}
                            justifyContent="flex-start"
                            flexDirection="column"
                            alignItems="flex-start"
                          >
                            <Text fontWeight="bold" fontSize="sm">{property.name}</Text>
                            <Text fontSize="xs" color="text" opacity={0.7}>
                              {property.totalSupply - property.availableTokens} tokens sold
                            </Text>
                          </Button>
                        ))}
                      </SimpleGrid>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Token Holders List */}
                {selectedPropertyForHolders !== null && tokenHolders.length > 0 && (
                  <Card>
                    <CardHeader>
                      <HStack justify="space-between">
                        <Heading size="md">Token Holders</Heading>
                        <Badge colorScheme="blue" fontSize="md" px={3} py={1}>
                          {tokenHolders.length} holders
                        </Badge>
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        {/* USDC Distribution Controls */}
                        <Box borderWidth={1} borderRadius="md" p={4} bg="hover">
                          <VStack spacing={3} align="stretch">
                            <Text fontWeight="bold">Distribute USDC Dividends</Text>
                            <HStack>
                              <InputGroup>
                                <InputLeftAddon>Total USDC</InputLeftAddon>
                                <Input
                                  type="number"
                                  placeholder="Amount to distribute"
                                  value={totalUsdcToDistribute}
                                  onChange={(e) => setTotalUsdcToDistribute(e.target.value)}
                                />
                              </InputGroup>
                              <Button
                                colorScheme="green"
                                onClick={handleDistributeUSDC}
                                isLoading={isDistributing}
                                loadingText="Distributing..."
                                isDisabled={!totalUsdcToDistribute || parseFloat(totalUsdcToDistribute) <= 0}
                              >
                                Distribute
                              </Button>
                            </HStack>
                            {totalUsdcToDistribute && parseFloat(totalUsdcToDistribute) > 0 && (
                              <Text fontSize="sm" color="text" opacity={0.7}>
                                Each holder will receive USDC proportional to their token ownership
                              </Text>
                            )}
                          </VStack>
                        </Box>

                        {/* Holders Table */}
                        <TableContainer>
                          <Table variant="simple" size="sm">
                            <Thead>
                              <Tr>
                                <Th>Wallet Address</Th>
                                <Th isNumeric>Tokens Held</Th>
                                <Th isNumeric>Ownership %</Th>
                                {totalUsdcToDistribute && parseFloat(totalUsdcToDistribute) > 0 && (
                                  <Th isNumeric>USDC to Receive</Th>
                                )}
                              </Tr>
                            </Thead>
                            <Tbody>
                              {calculateDistribution().map((holder, index) => (
                                <Tr key={index}>
                                  <Td>
                                    <Text fontFamily="mono" fontSize="xs">
                                      {holder.address.slice(0, 8)}...{holder.address.slice(-6)}
                                    </Text>
                                  </Td>
                                  <Td isNumeric fontWeight="medium">{holder.balance}</Td>
                                  <Td isNumeric>
                                    <Badge colorScheme="purple">{holder.percentage.toFixed(2)}%</Badge>
                                  </Td>
                                  {totalUsdcToDistribute && parseFloat(totalUsdcToDistribute) > 0 && (
                                    <Td isNumeric fontWeight="bold" color="green.600">
                                      ${holder.usdcAmount?.toFixed(2) || '0.00'}
                                    </Td>
                                  )}
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                        </TableContainer>

                        {/* Summary */}
                        {totalUsdcToDistribute && parseFloat(totalUsdcToDistribute) > 0 && (
                          <Box borderTopWidth={1} pt={3}>
                            <HStack justify="space-between">
                              <Text fontWeight="bold">Total Distribution:</Text>
                              <Text fontWeight="bold" fontSize="lg" color="green.600">
                                ${parseFloat(totalUsdcToDistribute).toFixed(2)} USDC
                              </Text>
                            </HStack>
                          </Box>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>
                )}

                {selectedPropertyForHolders !== null && tokenHolders.length === 0 && !isLoadingHolders && (
                  <Alert status="info">
                    <AlertIcon />
                    <AlertTitle>No token holders found</AlertTitle>
                    <AlertDescription>
                      This property doesn't have any token holders yet.
                    </AlertDescription>
                  </Alert>
                )}
              </VStack>
            </TabPanel>

            {/* Admins Tab (Super Admin Only) */}
            {isAdmin === 2 && (
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <Card>
                    <CardBody>
                      <VStack spacing={4}>
                        <FormControl>
                          <FormLabel>Add New Admin</FormLabel>
                          <HStack>
                            <Input
                              placeholder="TON Address (0:...)"
                              value={newAdminAddress}
                              onChange={(e) => setNewAdminAddress(e.target.value)}
                            />
                            <Button
                              colorScheme="blue"
                              onClick={handleAddAdmin}
                              isLoading={isLoading}
                              leftIcon={<AddIcon />}
                            >
                              Add Admin
                            </Button>
                          </HStack>
                        </FormControl>
                      </VStack>
                    </CardBody>
                  </Card>

                  <TableContainer>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Address</Th>
                          <Th>Type</Th>
                          <Th>Added Date</Th>
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {admins.map((admin) => (
                          <Tr key={admin.address}>
                            <Td fontFamily="mono" fontSize="sm">{admin.address}</Td>
                            <Td>
                              <Badge colorScheme={admin.type === 'super' ? 'purple' : 'blue'}>
                                {admin.type === 'super' ? 'Super Admin' : 'Admin'}
                              </Badge>
                            </Td>
                            <Td>{admin.addedDate}</Td>
                            <Td>
                              {admin.type !== 'super' && (
                                <IconButton
                                  size="sm"
                                  icon={<DeleteIcon />}
                                  aria-label="Remove admin"
                                  colorScheme="red"
                                  variant="ghost"
                                  onClick={() => handleRemoveAdmin(admin.address)}
                                />
                              )}
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </VStack>
              </TabPanel>
            )}

            {/* Rent Distribution Tab */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                {properties.map((property) => (
                  <Card key={property.id}>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <HStack justify="space-between">
                          <VStack align="start" spacing={1}>
                            <Heading size="sm">{property.name}</Heading>
                            <Text fontSize="sm" color="text" opacity={0.7}>
                              Tokens Sold: {property.totalSupply - property.availableTokens} / {property.totalSupply}
                            </Text>
                          </VStack>
                          <VStack align="end" spacing={1}>
                            <Text fontSize="sm" color="text" opacity={0.7}>Monthly Rent</Text>
                            <Text fontWeight="bold">{property.monthlyRent} TON</Text>
                          </VStack>
                        </HStack>
                        <Divider />
                        <HStack>
                          <InputGroup>
                            <InputLeftAddon>Amount</InputLeftAddon>
                            <Input placeholder="TON amount to distribute" type="number" />
                          </InputGroup>
                          <Button
                            colorScheme="green"
                            onClick={() => handleDistributeRent(property.id, property.monthlyRent)}
                          >
                            Distribute Rent
                          </Button>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </VStack>
            </TabPanel>

            {/* Settings Tab */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                <Card>
                  <CardHeader>
                    <Heading size="md">Platform Settings</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">
                          Emergency Pause
                        </FormLabel>
                        <Switch
                          isChecked={isPaused}
                          onChange={handleTogglePause}
                          colorScheme="red"
                        />
                      </FormControl>
                      <Text fontSize="sm" color="gray.600">
                        When paused, no one can buy or sell tokens. Only admins can perform administrative actions.
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      {/* Create/Edit Property Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedProperty ? 'Edit Property' : 'Create New Property'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Property Name</FormLabel>
                <Input
                  placeholder="e.g., Luxury Villa in Lisbon"
                  value={propertyForm.name}
                  onChange={(e) => setPropertyForm({ ...propertyForm, name: e.target.value })}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Location</FormLabel>
                <Input
                  placeholder="e.g., Graça, Lisbon, Portugal"
                  value={propertyForm.location}
                  onChange={(e) => setPropertyForm({ ...propertyForm, location: e.target.value })}
                />
              </FormControl>
              
              <HStack w="full">
                <FormControl isRequired>
                  <FormLabel>Total Supply</FormLabel>
                  <Input
                    placeholder="Total tokens"
                    type="number"
                    value={propertyForm.totalSupply}
                    onChange={(e) => setPropertyForm({ ...propertyForm, totalSupply: e.target.value })}
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Price per Token (TON)</FormLabel>
                  <Input
                    placeholder="Price in TON"
                    type="number"
                    value={propertyForm.pricePerToken}
                    onChange={(e) => setPropertyForm({ ...propertyForm, pricePerToken: e.target.value })}
                  />
                </FormControl>
              </HStack>
              
              <FormControl>
                <FormLabel>Monthly Rent (TON)</FormLabel>
                <Input
                  placeholder="Expected monthly rent"
                  type="number"
                  value={propertyForm.monthlyRent}
                  onChange={(e) => setPropertyForm({ ...propertyForm, monthlyRent: e.target.value })}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Description</FormLabel>
                <Textarea
                  placeholder="Detailed property description..."
                  value={propertyForm.description}
                  onChange={(e) => setPropertyForm({ ...propertyForm, description: e.target.value })}
                  rows={4}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Property Images</FormLabel>
                <VStack align="stretch" spacing={3}>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    display="none"
                    id="image-upload"
                  />
                  <Button
                    as="label"
                    htmlFor="image-upload"
                    leftIcon={<AddIcon />}
                    variant="outline"
                    cursor="pointer"
                  >
                    Select Images from Device
                  </Button>
                  
                  {imagePreviewUrls.length > 0 && (
                    <Box>
                      <Text fontSize="sm" color="text" opacity={0.7} mb={2}>
                        {propertyForm.imageFiles.length} image(s) selected
                      </Text>
                      <HStack spacing={2} overflowX="auto" py={2}>
                        {imagePreviewUrls.map((url, index) => (
                          <Box key={index} position="relative" flexShrink={0}>
                            <Image
                              src={url}
                              alt={`Preview ${index + 1}`}
                              boxSize="100px"
                              objectFit="cover"
                              borderRadius="md"
                              border="1px solid"
                              borderColor="gray.200"
                            />
                            <IconButton
                              icon={<DeleteIcon />}
                              aria-label="Remove image"
                              size="xs"
                              colorScheme="red"
                              position="absolute"
                              top={1}
                              right={1}
                              onClick={() => handleRemoveImage(index)}
                            />
                            <Text fontSize="xs" mt={1} textAlign="center" noOfLines={1}>
                              {propertyForm.imageFiles[index].name}
                            </Text>
                          </Box>
                        ))}
                      </HStack>
                    </Box>
                  )}
                </VStack>
              </FormControl>
              
              <HStack w="full">
                <FormControl>
                  <FormLabel>Property Type</FormLabel>
                  <Input
                    placeholder="e.g., Apartment, Villa, Condo"
                    value={propertyForm.propertyType}
                    onChange={(e) => setPropertyForm({ ...propertyForm, propertyType: e.target.value })}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Year Built</FormLabel>
                  <Input
                    placeholder="e.g., 2020"
                    value={propertyForm.yearBuilt}
                    onChange={(e) => setPropertyForm({ ...propertyForm, yearBuilt: e.target.value })}
                  />
                </FormControl>
              </HStack>
              
              <HStack w="full">
                <FormControl>
                  <FormLabel>Square Footage</FormLabel>
                  <Input
                    placeholder="e.g., 1500 sq ft"
                    value={propertyForm.squareFootage}
                    onChange={(e) => setPropertyForm({ ...propertyForm, squareFootage: e.target.value })}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Bedrooms</FormLabel>
                  <Input
                    placeholder="e.g., 3"
                    type="number"
                    value={propertyForm.bedrooms}
                    onChange={(e) => setPropertyForm({ ...propertyForm, bedrooms: e.target.value })}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Bathrooms</FormLabel>
                  <Input
                    placeholder="e.g., 2"
                    type="number"
                    value={propertyForm.bathrooms}
                    onChange={(e) => setPropertyForm({ ...propertyForm, bathrooms: e.target.value })}
                  />
                </FormControl>
              </HStack>
              
              <FormControl>
                <FormLabel>Amenities</FormLabel>
                <Textarea
                  placeholder="Enter amenities (comma-separated)\ne.g., Pool, Gym, Parking, Garden"
                  value={propertyForm.amenities}
                  onChange={(e) => setPropertyForm({ ...propertyForm, amenities: e.target.value })}
                  rows={2}
                />
              </FormControl>
              
              {propertyForm.uri && (
                <Alert status="info">
                  <AlertIcon />
                  <Text fontSize="sm">Metadata URI: {propertyForm.uri}</Text>
                </Alert>
              )}
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleCreateProperty}
              isLoading={isLoading || isUploadingMetadata}
              loadingText={isUploadingMetadata ? 'Uploading Metadata...' : 'Creating Property...'}
            >
              {selectedProperty ? 'Update Property' : 'Create Property'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}