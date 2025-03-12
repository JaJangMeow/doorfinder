
import React from "react";

interface PropertyFormStepsProps {
  formStep: number;
}

const PropertyFormSteps: React.FC<PropertyFormStepsProps> = ({ formStep }) => {
  return (
    <div className="flex items-center mb-6">
      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${formStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
        1
      </div>
      <div className={`flex-1 h-1 mx-2 ${formStep >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${formStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
        2
      </div>
      <div className={`flex-1 h-1 mx-2 ${formStep >= 3 ? 'bg-primary' : 'bg-muted'}`}></div>
      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${formStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
        3
      </div>
    </div>
  );
};

export default PropertyFormSteps;
