import React from 'react';
import { Helmet } from 'react-helmet-async';

interface JobPostingBaseSalary {
  currency: string;
  value: number | { minValue: number; maxValue: number; unitText: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'YEAR' };
  unitText?: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
}

interface JobLocation {
  addressLocality: string;
  addressRegion?: string;
  postalCode?: string;
  addressCountry?: string;
  streetAddress?: string;
}

interface JobPostingSchemaProps {
  title: string;
  description: string;
  datePosted: string; // ISO 8601 format
  validThrough?: string; // ISO 8601 format
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACTOR' | 'TEMPORARY' | 'INTERN' | 'VOLUNTEER' | 'PER_DIEM' | 'OTHER';
  hiringOrganization: {
    name: string;
    sameAs?: string; // URL of the company
    logo?: string; // URL to the logo
  };
  jobLocation?: JobLocation;
  applicantLocationRequirements?: string[]; // e.g. ["US-NY", "US-CA"]
  jobLocationType?: 'TELECOMMUTE'; // Use for remote jobs
  baseSalary?: JobPostingBaseSalary;
  skills?: string;
  qualifications?: string;
  responsibilities?: string;
  educationRequirements?: string;
  experienceRequirements?: string;
  workHours?: string;
  jobBenefits?: string;
}

/**
 * Component for implementing schema.org JobPosting markup
 * This helps search engines understand job posting information and enables rich job snippets
 * in search results with details about position, salary, location, etc.
 */
const JobPostingSchema: React.FC<JobPostingSchemaProps> = ({
  title,
  description,
  datePosted,
  validThrough,
  employmentType,
  hiringOrganization,
  jobLocation,
  applicantLocationRequirements,
  jobLocationType,
  baseSalary,
  skills,
  qualifications,
  responsibilities,
  educationRequirements,
  experienceRequirements,
  workHours,
  jobBenefits
}) => {
  // Build the job posting schema
  const jobPostingSchema: any = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    'title': title,
    'description': description,
    'datePosted': datePosted,
    'employmentType': employmentType,
    'hiringOrganization': {
      '@type': 'Organization',
      'name': hiringOrganization.name,
      ...(hiringOrganization.sameAs && { 'sameAs': hiringOrganization.sameAs }),
      ...(hiringOrganization.logo && { 'logo': hiringOrganization.logo })
    }
  };

  // Add optional properties
  if (validThrough) jobPostingSchema.validThrough = validThrough;

  // Add job location (physical or remote)
  if (jobLocation) {
    jobPostingSchema.jobLocation = {
      '@type': 'Place',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': jobLocation.addressLocality,
        ...(jobLocation.addressRegion && { 'addressRegion': jobLocation.addressRegion }),
        ...(jobLocation.postalCode && { 'postalCode': jobLocation.postalCode }),
        ...(jobLocation.addressCountry && { 'addressCountry': jobLocation.addressCountry }),
        ...(jobLocation.streetAddress && { 'streetAddress': jobLocation.streetAddress })
      }
    };
  }

  // For remote jobs
  if (jobLocationType) {
    jobPostingSchema.jobLocationType = jobLocationType;
  }

  // Add applicant location requirements if specified
  if (applicantLocationRequirements && applicantLocationRequirements.length > 0) {
    jobPostingSchema.applicantLocationRequirements = applicantLocationRequirements.map(location => ({
      '@type': 'Country',
      'name': location
    }));
  }

  // Add salary information if provided
  if (baseSalary) {
    jobPostingSchema.baseSalary = {
      '@type': 'MonetaryAmount',
      'currency': baseSalary.currency,
      'value': {
        '@type': 'QuantitativeValue',
        ...(typeof baseSalary.value === 'number'
          ? { 'value': baseSalary.value }
          : {
              'minValue': baseSalary.value.minValue,
              'maxValue': baseSalary.value.maxValue,
              'unitText': baseSalary.value.unitText
            }
        ),
        ...(baseSalary.unitText && typeof baseSalary.value === 'number' && { 'unitText': baseSalary.unitText })
      }
    };
  }

  // Add other optional job details
  if (skills) jobPostingSchema.skills = skills;
  if (qualifications) jobPostingSchema.qualifications = qualifications;
  if (responsibilities) jobPostingSchema.responsibilities = responsibilities;
  if (educationRequirements) jobPostingSchema.educationRequirements = educationRequirements;
  if (experienceRequirements) jobPostingSchema.experienceRequirements = experienceRequirements;
  if (workHours) jobPostingSchema.workHours = workHours;
  if (jobBenefits) jobPostingSchema.jobBenefits = jobBenefits;

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(jobPostingSchema)}
      </script>
    </Helmet>
  );
};

export default JobPostingSchema;
