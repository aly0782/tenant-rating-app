import axios from 'axios';

const PINATA_BASE_URL = 'https://api.pinata.cloud';
const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

interface PropertyMetadata {
  name: string;
  location: string;
  description: string;
  images: string[];
  documents?: string[];
  totalSupply: string;
  pricePerToken: string;
  monthlyRent: string;
  propertyType?: string;
  yearBuilt?: string;
  squareFootage?: string;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export class PinataUploader {
  private jwt: string;

  constructor(jwt: string) {
    this.jwt = jwt;
  }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.jwt}`,
      'Content-Type': 'application/json',
    };
  }

  async uploadJSON(metadata: PropertyMetadata): Promise<string> {
    try {
      const response = await axios.post(
        `${PINATA_BASE_URL}/pinning/pinJSONToIPFS`,
        {
          pinataContent: metadata,
          pinataMetadata: {
            name: `reitx-property-${metadata.name.toLowerCase().replace(/\s+/g, '-')}`,
            keyvalues: {
              property: metadata.name,
              location: metadata.location,
              type: 'property-metadata',
            },
          },
        },
        {
          headers: this.getHeaders(),
        }
      );

      if (response.data && response.data.IpfsHash) {
        return `${IPFS_GATEWAY}${response.data.IpfsHash}`;
      }
      
      throw new Error('No IPFS hash returned from Pinata');
    } catch (error: any) {
      console.error('Pinata upload error:', error);
      if (error.response) {
        throw new Error(`Pinata upload failed: ${error.response.data.error || error.response.statusText}`);
      }
      throw new Error(`Failed to upload to Pinata: ${error.message}`);
    }
  }

  async uploadFile(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const metadata = JSON.stringify({
        name: file.name,
        keyvalues: {
          type: 'property-image',
        },
      });
      formData.append('pinataMetadata', metadata);

      const response = await axios.post(
        `${PINATA_BASE_URL}/pinning/pinFileToIPFS`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${this.jwt}`,
          },
        }
      );

      if (response.data && response.data.IpfsHash) {
        return `${IPFS_GATEWAY}${response.data.IpfsHash}`;
      }
      
      throw new Error('No IPFS hash returned from Pinata');
    } catch (error: any) {
      console.error('Pinata file upload error:', error);
      if (error.response) {
        throw new Error(`Pinata file upload failed: ${error.response.data.error || error.response.statusText}`);
      }
      throw new Error(`Failed to upload file to Pinata: ${error.message}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(
        `${PINATA_BASE_URL}/data/testAuthentication`,
        {
          headers: this.getHeaders(),
        }
      );
      return response.status === 200;
    } catch (error) {
      console.error('Pinata connection test failed:', error);
      return false;
    }
  }
}

export function buildPropertyMetadata(
  form: {
    name: string;
    location: string;
    description: string;
    images: string[];
    totalSupply: string;
    pricePerToken: string;
    monthlyRent: string;
    propertyType?: string;
    yearBuilt?: string;
    squareFootage?: string;
    bedrooms?: number;
    bathrooms?: number;
    amenities?: string[];
  }
): PropertyMetadata {
  return {
    name: form.name,
    location: form.location,
    description: form.description,
    images: form.images,
    totalSupply: form.totalSupply,
    pricePerToken: form.pricePerToken,
    monthlyRent: form.monthlyRent,
    propertyType: form.propertyType,
    yearBuilt: form.yearBuilt,
    squareFootage: form.squareFootage,
    bedrooms: form.bedrooms,
    bathrooms: form.bathrooms,
    amenities: form.amenities,
  };
}