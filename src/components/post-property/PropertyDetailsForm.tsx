
import React from "react";
import PropertyBasicInfo from "./PropertyBasicInfo";
import PropertyTypeSelection from "./PropertyTypeSelection";
import PropertyFeatures from "./PropertyFeatures";
import PropertyAdditionalInfo from "./PropertyAdditionalInfo";

interface PropertyDetailsFormProps {
  methods: any;
  popularColleges: string[];
}

const PropertyDetailsForm: React.FC<PropertyDetailsFormProps> = ({ methods, popularColleges }) => {
  const { setValue } = methods;
  
  // Use controlled handlers to prevent form resets
  const handleSelectChange = (field: string, value: string) => {
    setValue(field, value, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
  };

  return (
    <div className="glass rounded-xl p-6 space-y-6">
      <PropertyBasicInfo methods={methods} />
      <PropertyTypeSelection methods={methods} />
      <PropertyFeatures methods={methods} />
      <PropertyAdditionalInfo methods={methods} popularColleges={popularColleges} />
    </div>
  );
};

export default PropertyDetailsForm;
