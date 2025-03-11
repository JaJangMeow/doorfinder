
import React from 'react';
import { User, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContactInformationProps {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  onContactClick: () => void;
}

const ContactInformation: React.FC<ContactInformationProps> = ({
  contactName,
  contactEmail,
  contactPhone,
  onContactClick
}) => {
  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
      <div className="mt-2">
        <div className="flex items-center text-gray-700">
          <User className="mr-2 h-5 w-5" />
          {contactName}
        </div>
        <div className="flex items-center text-gray-700">
          <Mail className="mr-2 h-5 w-5" />
          {contactEmail}
        </div>
        <div className="flex items-center text-gray-700">
          <Phone className="mr-2 h-5 w-5" />
          {contactPhone}
        </div>
      </div>
      <Button className="mt-4" onClick={onContactClick}>
        Contact Owner
      </Button>
    </div>
  );
};

export default ContactInformation;
