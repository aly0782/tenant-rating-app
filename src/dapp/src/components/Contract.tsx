import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Code,
  Button,
  Link,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Divider,
  useClipboard,
  useToast,
  Icon,
} from '@chakra-ui/react';
import { CopyIcon, ExternalLinkIcon, CheckIcon } from '@chakra-ui/icons';
import contractConfig from '../config/contract.json';

export default function Contract() {
  const { hasCopied: hasAddressCopied, onCopy: onAddressCopy } = useClipboard(contractConfig.factoryAddress);
  const { hasCopied: hasSuperCopied, onCopy: onSuperCopy } = useClipboard(contractConfig.superAdmin);
  const toast = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${label} copied`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="xl" mb={2}>Smart Contract Details</Heading>
          <Text color="gray.600">
            REITx Multi-Admin Factory Contract deployed on TON Testnet
          </Text>
        </Box>

        {/* Contract Information */}
        <Card>
          <CardHeader>
            <Heading size="md">Contract Address</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <HStack justify="space-between">
                <Code fontSize="sm" p={3} borderRadius="md" w="full">
                  {contractConfig.factoryAddress}
                </Code>
                <Button
                  size="sm"
                  onClick={onAddressCopy}
                  leftIcon={hasAddressCopied ? <CheckIcon /> : <CopyIcon />}
                >
                  {hasAddressCopied ? 'Copied' : 'Copy'}
                </Button>
              </HStack>
              <HStack spacing={4}>
                <Link
                  href={`https://testnet.tonscan.org/address/${contractConfig.factoryAddress}`}
                  isExternal
                  color="blue.500"
                >
                  View on Explorer <ExternalLinkIcon mx="2px" />
                </Link>
                <Badge colorScheme="green">Active</Badge>
                <Badge colorScheme="blue">{contractConfig.network}</Badge>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Admin Information */}
        <Card>
          <CardHeader>
            <Heading size="md">Admin Addresses</Heading>
          </CardHeader>
          <CardBody>
            <TableContainer>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Address</Th>
                    <Th>Role</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td>
                      <Code fontSize="xs">{contractConfig.superAdmin}</Code>
                    </Td>
                    <Td>
                      <Badge colorScheme="purple">Super Admin</Badge>
                    </Td>
                    <Td>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => copyToClipboard(contractConfig.superAdmin, 'Address')}
                      >
                        <CopyIcon />
                      </Button>
                    </Td>
                  </Tr>
                  {contractConfig.admins.map((admin, index) => (
                    <Tr key={index}>
                      <Td>
                        <Code fontSize="xs">{admin}</Code>
                      </Td>
                      <Td>
                        <Badge colorScheme="blue">Admin</Badge>
                      </Td>
                      <Td>
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => copyToClipboard(admin, 'Address')}
                        >
                          <CopyIcon />
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </CardBody>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <Heading size="md">Contract Features</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={3}>
              {Object.entries(contractConfig.features).map(([feature, enabled]) => (
                <HStack key={feature} justify="space-between">
                  <Text textTransform="capitalize">
                    {feature.replace(/([A-Z])/g, ' $1').trim()}
                  </Text>
                  <Badge colorScheme={enabled ? 'green' : 'gray'}>
                    {enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </HStack>
              ))}
            </VStack>
          </CardBody>
        </Card>

        {/* Contract Methods */}
        <Card>
          <CardHeader>
            <Heading size="md">Available Operations</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <Box>
                <Heading size="sm" mb={2}>Admin Operations</Heading>
                <VStack align="stretch" spacing={2} pl={4}>
                  <Text fontSize="sm">• Create Property (0x12345678)</Text>
                  <Text fontSize="sm">• Add Admin (0xddccbbaa)</Text>
                  <Text fontSize="sm">• Remove Admin (0xeeffddcc)</Text>
                  <Text fontSize="sm">• Distribute Rent (0xaabbccdd)</Text>
                  <Text fontSize="sm">• Pause/Unpause Platform</Text>
                </VStack>
              </Box>
              <Divider />
              <Box>
                <Heading size="sm" mb={2}>User Operations</Heading>
                <VStack align="stretch" spacing={2} pl={4}>
                  <Text fontSize="sm">• Buy Tokens (0x87654321)</Text>
                  <Text fontSize="sm">• Sell Tokens (0x11111111)</Text>
                  <Text fontSize="sm">• Get Property Info</Text>
                  <Text fontSize="sm">• Get User Holdings</Text>
                  <Text fontSize="sm">• Check Balance</Text>
                </VStack>
              </Box>
            </VStack>
          </CardBody>
        </Card>

        {/* Deployment Info */}
        <Card>
          <CardHeader>
            <Heading size="md">Deployment Information</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={3}>
              <HStack justify="space-between">
                <Text fontWeight="semibold">Network:</Text>
                <Badge>{contractConfig.network}</Badge>
              </HStack>
              <HStack justify="space-between">
                <Text fontWeight="semibold">Deployed At:</Text>
                <Text fontSize="sm">
                  {new Date(contractConfig.deployedAt).toLocaleString()}
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontWeight="semibold">Contract Version:</Text>
                <Badge>Multi-Admin v1.0</Badge>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Integration Guide */}
        <Card>
          <CardHeader>
            <Heading size="md">Integration Guide</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <Text fontSize="sm">
                To interact with this contract, you can use the following approaches:
              </Text>
              <Box>
                <Text fontWeight="semibold" mb={2}>1. Using TON Connect:</Text>
                <Code fontSize="xs" p={3} borderRadius="md" w="full">
                  {`import { useTonConnect } from '@tonconnect/ui-react';
const { sender } = useTonConnect();
await sender.send({
  to: "${contractConfig.factoryAddress}",
  value: toNano('0.1'),
  body: messageBody
});`}
                </Code>
              </Box>
              <Box>
                <Text fontWeight="semibold" mb={2}>2. Direct Contract Call:</Text>
                <Code fontSize="xs" p={3} borderRadius="md" w="full">
                  {`const client = new TonClient({ endpoint });
const factory = client.open(contractAddress);
await factory.sendCreateProperty(...);`}
                </Code>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
}