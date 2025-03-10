
import React from "react";
import { useParams } from "react-router-dom";
import PropertyDetailComponent, { PropertyDetailData } from "@/components/PropertyDetail";

// Mock data - in a real app this would come from an API
const mockProperties: Record<string, PropertyDetailData> = {
  "1": {
    id: "1",
    title: "Modern Downtown Apartment",
    address: "123 Main St, New York, NY 10001",
    price: 2500,
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 950,
    availableFrom: "2023-08-01",
    description: "This beautiful apartment features modern finishes throughout, with an open floor plan perfect for entertaining. The kitchen has stainless steel appliances and quartz countertops.\n\nThe building offers amenities including a fitness center, rooftop lounge, and 24-hour doorman. Located in the heart of downtown, you'll be steps away from restaurants, shopping, and public transportation.",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
      "https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1674&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
    ],
    contactName: "Jane Smith",
    contactEmail: "jane.smith@example.com",
    contactPhone: "(212) 555-1234"
  },
  "2": {
    id: "2",
    title: "Spacious Family Home with Garden",
    address: "456 Oak Ave, San Francisco, CA 94117",
    price: 4200,
    bedrooms: 4,
    bathrooms: 3,
    squareFeet: 1800,
    availableFrom: "2023-09-01",
    description: "This charming family home offers plenty of space for comfortable living. The main floor features a large living room with a fireplace, formal dining room, and updated kitchen with breakfast nook.\n\nUpstairs you'll find four bedrooms including a master suite with ensuite bathroom. The backyard includes a beautifully landscaped garden and patio perfect for outdoor entertaining. Located in a quiet neighborhood with excellent schools nearby.",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
    ],
    contactName: "Robert Johnson",
    contactEmail: "robert.johnson@example.com",
    contactPhone: "(415) 555-6789"
  },
  "3": {
    id: "3",
    title: "Cozy Studio in Historic Building",
    address: "789 Maple St, Chicago, IL 60611",
    price: 1200,
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: 550,
    availableFrom: "2023-07-15",
    description: "This well-designed studio apartment makes efficient use of space with a stylish murphy bed and multi-functional furniture. The kitchen features compact appliances and clever storage solutions.\n\nThe historic building has been beautifully maintained, with original hardwood floors and high ceilings. Building amenities include laundry facilities and secure entry. Located in a vibrant neighborhood with cafes, shops, and public transit within walking distance.",
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
      "https://images.unsplash.com/photo-1552242718-c5360894aecd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
      "https://images.unsplash.com/photo-1599619351208-3e6c839d6828?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1760&q=80"
    ],
    contactName: "Michael Davis",
    contactEmail: "michael.davis@example.com",
    contactPhone: "(312) 555-9012"
  }
};

const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const property = id ? mockProperties[id] : null;

  // Handle loading and error states
  if (!id) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Property Not Found</h1>
          <p className="text-muted-foreground">The property ID is missing.</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Property Not Found</h1>
          <p className="text-muted-foreground">We couldn't find a property with ID: {id}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 container mx-auto px-4">
      <PropertyDetailComponent property={property} />
    </div>
  );
};

export default PropertyDetailPage;
