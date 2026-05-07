import React, { useEffect } from 'react';

interface Job {
  id: string;
  title: string;
  description?: string;
  content?: string;
  organization: string;
  publishedDate: string;
  deadline?: string;
  deadlineISO?: string;
  imageUrls?: string[];
  link?: string;
  location?: string;
  applyLink?: string;
  source?: string;
}

interface JobSchemaHelmetProps {
  job: Job;
  pageTitle?: string;
  pageDescription?: string;
}

const JobSchemaHelmet: React.FC<JobSchemaHelmetProps> = ({
  job,
  pageTitle,
  pageDescription
}) => {
  useEffect(() => {
    // Update document title
    if (pageTitle) {
      document.title = pageTitle;
    } else {
      document.title = `${job.title} - JOBS`;
    }

    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    const description = pageDescription || job.content?.substring(0, 160) || job.title;
    metaDescription.setAttribute('content', description);

    // Create and inject JSON-LD schema
    const schemaId = 'job-posting-schema';
    let scriptElement = document.getElementById(schemaId) as HTMLScriptElement;
    
    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.id = schemaId;
      scriptElement.type = 'application/ld+json';
      document.head.appendChild(scriptElement);
    }

    const schema = {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      "title": job.title,
      "description": job.content?.substring(0, 500) || job.title,
      "image": job.imageUrls && job.imageUrls.length > 0 ? job.imageUrls[0] : undefined,
      "url": typeof window !== 'undefined' ? window.location.href : `https://jobs.talukdaracademy.com.bd/?job=${job.id}`,
      "datePosted": job.publishedDate,
      "validThrough": job.deadlineISO || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      "jobLocationType": "REMOTE",
      "applicantLocationRequirements": {
        "@type": "Country",
        "name": "BD"
      },
      "hiringOrganization": {
        "@type": "Organization",
        "name": job.organization || "JOBS Bangladesh",
        "sameAs": job.link || "https://jobs.talukdaracademy.com.bd",
        "logo": "https://jobs.talukdaracademy.com.bd/logo.png"
      },
      "jobLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "BD",
          "addressLocality": job.location || "Bangladesh"
        }
      },
      "employmentType": "FULL_TIME",
      "baseSalary": {
        "@type": "PriceSpecification",
        "currency": "BDT"
      },
      "applicationUrl": job.applyLink || "https://jobs.talukdaracademy.com.bd"
    };

    // Remove undefined properties
    Object.keys(schema).forEach(key => {
      if (schema[key as keyof typeof schema] === undefined) {
        delete schema[key as keyof typeof schema];
      }
    });

    scriptElement.textContent = JSON.stringify(schema);

    // Cleanup: Remove schema when component unmounts or job changes
    return () => {
      if (scriptElement && scriptElement.parentNode) {
        scriptElement.parentNode.removeChild(scriptElement);
      }
    };
  }, [job, pageTitle, pageDescription]);

  return null; // This component doesn't render anything visible
};

export default JobSchemaHelmet;
