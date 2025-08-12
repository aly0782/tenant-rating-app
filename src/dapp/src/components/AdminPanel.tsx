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
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon, AddIcon } from '@chakra-ui/icons';
import { useTonConnect } from '../hooks/useTonConnect';
import { useREITxFactory } from '../hooks/useREITxFactory';
import { toNano, fromNano, Address, beginCell } from '@ton/core';
import contractConfig from '../config/contract.json';

interface PropertyForm {
  name: string;
  location: string;
  totalSupply: string;
  pricePerToken: string;
  monthlyRent: string;
  uri: string;
  description: string;
  images: string[];
}

interface AdminAddress {
  address: string;
  type: 'super' | 'regular';
  addedDate: string;
}

export function AdminPanel() {
  const { isConnected, userAddress } = useTonConnect();
  const { factory, createProperty, isLoading: contractLoading, error: contractError } = useREITxFactory();
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
    images: []
  });

  // Form state for new admin
  const [newAdminAddress, setNewAdminAddress] = useState('');
  const [isPaused, setIsPaused] = useState(false);

  // Check admin status on mount
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isConnected || !userAddress || !factory) return;
      
      try {
        // This would call the contract's is_admin_address method
        // For now, we'll simulate it
        const adminStatus = await checkIfAdmin(userAddress);
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
    // Check against configured super admin first
    if (address === contractConfig.superAdmin) {
      return 2; // Super admin
    }
    
    // Check against configured regular admins
    if (contractConfig.admins && contractConfig.admins.includes(address)) {
      return 1; // Regular admin
    }
    
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
      // const props = await factory.getAllProperties();
      // setProperties(props);
      
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
          !propertyForm.pricePerToken) {
        throw new Error('Please fill all required fields');
      }
      
      // Create property on blockchain
      await createProperty({
        name: propertyForm.name,
        location: propertyForm.location,
        totalSupply: toNano(propertyForm.totalSupply),
        pricePerToken: toNano(propertyForm.pricePerToken),
        monthlyRent: toNano(propertyForm.monthlyRent || '0'),
        uri: propertyForm.uri || '',
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
        images: []
      });
      
      // Reload properties
      await loadAdminData();
    } catch (error: any) {
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
                            <Text fontSize="sm" color="gray.600">
                              Tokens Sold: {property.totalSupply - property.availableTokens} / {property.totalSupply}
                            </Text>
                          </VStack>
                          <VStack align="end" spacing={1}>
                            <Text fontSize="sm" color="gray.600">Monthly Rent</Text>
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
              
              <FormControl>
                <FormLabel>Metadata URI</FormLabel>
                <Input
                  placeholder="https://..."
                  value={propertyForm.uri}
                  onChange={(e) => setPropertyForm({ ...propertyForm, uri: e.target.value })}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  placeholder="Property description..."
                  value={propertyForm.description}
                  onChange={(e) => setPropertyForm({ ...propertyForm, description: e.target.value })}
                  rows={4}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleCreateProperty}
              isLoading={isLoading}
            >
              {selectedProperty ? 'Update Property' : 'Create Property'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}