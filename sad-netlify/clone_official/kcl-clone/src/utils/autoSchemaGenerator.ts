/**
 * Enhanced Auto Schema Generator
 * Automatically generates schema.org structured data based on page content
 * with advanced detection capabilities and schema validation
 */

import { extractSchemaTypes } from './richResultsTest';
import { testStructuredData } from './pageSpeedInsights';

/**
 * Detects page type and generates appropriate schema.org markup
 * @returns Generated schema object or null if page type is unknown
 */
export const detectPageTypeAndGenerateSchema = (): any => {
  // Get page metadata
  const title = document.title;
  const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
  const canonicalUrl = document.querySelector('link[rel="canonical"]')?.getAttribute('href') || window.location.href;
  const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';
  const currentUrl = window.location.href;
  const pathSegments = window.location.pathname.split('/').filter(Boolean);

  // Check if schema already exists on the page to avoid duplication
  const existingSchemaTypes = extractSchemaTypes();

  // Product page detection
  if (
    (pathSegments.includes('product') || pathSegments.includes('deals')) &&
    document.querySelector('.product-details, [data-product-id], [itemtype*="Product"]')
  ) {
    if (existingSchemaTypes.includes('Product')) return null;

    return generateProductSchema();
  }

  // Article/Blog page detection
  if (
    (pathSegments.includes('blog') || pathSegments.includes('article') || pathSegments.includes('tips')) &&
    document.querySelector('article, .blog-post, .article-content')
  ) {
    if (existingSchemaTypes.includes('Article') ||
        existingSchemaTypes.includes('BlogPosting') ||
        existingSchemaTypes.includes('NewsArticle')) {
      return null;
    }

    return generateArticleSchema();
  }

  // FAQ page detection
  if (
    document.querySelectorAll('details, summary, [aria-expanded], dl dt+dd, .faq-item, .accordion-item').length > 3 ||
    document.querySelector('[itemtype*="FAQPage"]')
  ) {
    if (existingSchemaTypes.includes('FAQPage')) return null;

    return generateFAQSchema();
  }

  // Event page detection
  if (
    (pathSegments.includes('event') || pathSegments.includes('webinar') || pathSegments.includes('conference')) &&
    document.querySelector('.event-details, [itemtype*="Event"], [data-event-id]')
  ) {
    if (existingSchemaTypes.includes('Event')) return null;

    return generateEventSchema();
  }

  // Recipe page detection
  if (
    (pathSegments.includes('recipe') || pathSegments.includes('recipes')) &&
    (document.querySelector('.recipe, .ingredients, .instructions, [itemtype*="Recipe"]') ||
     document.querySelectorAll('h2, h3').length >= 3 && document.querySelectorAll('ul, ol').length >= 2)
  ) {
    if (existingSchemaTypes.includes('Recipe')) return null;

    return generateRecipeSchema();
  }

  // Job posting detection
  if (
    (pathSegments.includes('job') || pathSegments.includes('career') || pathSegments.includes('careers') ||
     pathSegments.includes('positions') || pathSegments.includes('jobs')) &&
    (document.querySelector('.job-details, .career-listing, [itemtype*="JobPosting"]') ||
     (document.querySelector('h1, .job-title') &&
      (document.body.textContent?.toLowerCase().includes('apply') ||
       document.body.textContent?.toLowerCase().includes('qualifications') ||
       document.body.textContent?.toLowerCase().includes('requirements') ||
       document.body.textContent?.toLowerCase().includes('responsibilities')))
    )
  ) {
    if (existingSchemaTypes.includes('JobPosting')) return null;

    return generateJobPostingSchema();
  }

  // Default to Website schema if nothing else matches
  if (!existingSchemaTypes.includes('WebSite')) {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': title.split('|')[0].trim(),
      'description': description,
      'url': canonicalUrl,
      ...(ogImage && { 'image': ogImage })
    };
  }

  return null;
};

/**
 * Generate Product schema based on page elements
 */
const generateProductSchema = (): any => {
  // Extract product details from page elements
  const name = document.querySelector('h1, .product-title')?.textContent?.trim() || document.title;
  const description = document.querySelector('.product-description, [itemprop="description"]')?.textContent?.trim() ||
                     document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
  const imageEl = document.querySelector('.product-image img, [itemprop="image"]') as HTMLImageElement;
  const imageUrl = imageEl?.src || document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';

  // Price extraction logic
  const priceEl = document.querySelector('.product-price, [itemprop="price"]');
  let price: number | null = null;
  let priceCurrency = 'USD';

  if (priceEl) {
    const priceText = priceEl.textContent || '';
    // Extract digits from price string
    const priceMatch = priceText.match(/[\d,.]+/);
    if (priceMatch) {
      price = parseFloat(priceMatch[0].replace(/,/g, ''));
    }

    // Try to extract currency
    const currencyElement = document.querySelector('[itemprop="priceCurrency"]');
    if (currencyElement) {
      priceCurrency = currencyElement.getAttribute('content') || 'USD';
    } else if (priceText.includes('$')) {
      priceCurrency = 'USD';
    } else if (priceText.includes('€')) {
      priceCurrency = 'EUR';
    } else if (priceText.includes('£')) {
      priceCurrency = 'GBP';
    }
  }

  // Availability determination
  let availability = 'https://schema.org/InStock';
  const stockElement = document.querySelector('.stock-status, [itemprop="availability"]');
  if (stockElement) {
    const stockText = stockElement.textContent?.toLowerCase() || '';
    if (stockText.includes('out of stock') || stockText.includes('sold out')) {
      availability = 'https://schema.org/OutOfStock';
    } else if (stockText.includes('pre-order')) {
      availability = 'https://schema.org/PreOrder';
    }
  }

  // Brand extraction
  const brandEl = document.querySelector('.product-brand, [itemprop="brand"]');
  const brand = brandEl ? (brandEl.textContent?.trim() || '') : '';

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': name,
    'description': description,
    'image': imageUrl,
    ...(brand && {
      'brand': {
        '@type': 'Brand',
        'name': brand
      }
    }),
    ...(price !== null && {
      'offers': {
        '@type': 'Offer',
        'price': price,
        'priceCurrency': priceCurrency,
        'availability': availability,
        'url': window.location.href
      }
    })
  };
};

/**
 * Generate Article schema based on page elements
 */
const generateArticleSchema = (): any => {
  // Extract article details
  const title = document.querySelector('h1, .article-title')?.textContent?.trim() || document.title;
  const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
  const imageUrl = document.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
                  (document.querySelector('.article-image img, .post-image img') as HTMLImageElement)?.src || '';

  // Author extraction
  const authorEl = document.querySelector('.author-name, [itemprop="author"], .byline');
  const authorName = authorEl?.textContent?.trim() || 'Editorial Team';

  // Date extraction
  let datePublished = '';
  const dateEl = document.querySelector('.published-date, [itemprop="datePublished"], time');
  if (dateEl) {
    datePublished = dateEl.getAttribute('datetime') || dateEl.textContent?.trim() || '';
  }
  if (!datePublished) {
    // Default to a recent date if none found
    const lastModified = document.lastModified;
    datePublished = lastModified ? new Date(lastModified).toISOString() : new Date().toISOString();
  }

  // Detect article type based on content
  let articleType = 'Article';
  const contentText = document.querySelector('article, .article-content, .post-content')?.textContent?.toLowerCase() || '';

  if (pathSegments.includes('news') ||
      contentText.includes('breaking news') ||
      contentText.includes('latest update')) {
    articleType = 'NewsArticle';
  } else if (pathSegments.includes('blog') ||
             document.querySelector('.blog-post') ||
             contentText.includes('blog post')) {
    articleType = 'BlogPosting';
  }

  return {
    '@context': 'https://schema.org',
    '@type': articleType,
    'headline': title,
    'description': description,
    'image': imageUrl,
    'datePublished': datePublished,
    'dateModified': datePublished, // Default to published date if no modified date found
    'author': {
      '@type': 'Person',
      'name': authorName
    },
    'publisher': {
      '@type': 'Organization',
      'name': document.querySelector('meta[property="og:site_name"]')?.getAttribute('content') || 'Sales Aholics Deals',
      'logo': {
        '@type': 'ImageObject',
        'url': document.querySelector('link[rel="icon"]')?.getAttribute('href') || '/logo.png'
      }
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': window.location.href
    }
  };
};

/**
 * Generate FAQ schema based on page elements
 */
const generateFAQSchema = (): any => {
  const faqItems: Array<{question: string, answer: string}> = [];

  // Try to detect FAQ pattern 1: dt/dd pairs
  const dlElements = document.querySelectorAll('dl');
  dlElements.forEach(dl => {
    const dtElements = dl.querySelectorAll('dt');
    dtElements.forEach(dt => {
      const question = dt.textContent?.trim() || '';
      const ddElement = dt.nextElementSibling;
      const answer = ddElement?.textContent?.trim() || '';

      if (question && answer) {
        faqItems.push({ question, answer });
      }
    });
  });

  // Try to detect FAQ pattern 2: details/summary
  const detailsElements = document.querySelectorAll('details');
  detailsElements.forEach(details => {
    const summaryElement = details.querySelector('summary');
    if (summaryElement) {
      const question = summaryElement.textContent?.trim() || '';
      let answer = '';

      // Extract answer text from the details content, excluding the summary
      details.childNodes.forEach(node => {
        if (node !== summaryElement && node.textContent) {
          answer += node.textContent.trim() + ' ';
        }
      });

      if (question && answer) {
        faqItems.push({ question, answer: answer.trim() });
      }
    }
  });

  // Try to detect FAQ pattern 3: accordion-like elements
  const accordionItems = document.querySelectorAll('.faq-item, .accordion-item');
  accordionItems.forEach(item => {
    const questionEl = item.querySelector('.faq-question, .accordion-header');
    const answerEl = item.querySelector('.faq-answer, .accordion-body');

    if (questionEl && answerEl) {
      const question = questionEl.textContent?.trim() || '';
      const answer = answerEl.textContent?.trim() || '';

      if (question && answer) {
        faqItems.push({ question, answer });
      }
    }
  });

  // Try to detect FAQ pattern 4: heading followed by paragraph
  const contentEl = document.querySelector('.faq-content, .faqs, [itemprop="mainContentOfPage"]');
  if (contentEl) {
    const headings = contentEl.querySelectorAll('h2, h3, h4');
    headings.forEach(heading => {
      const question = heading.textContent?.trim() || '';
      let answerEl = heading.nextElementSibling;
      let answer = '';

      // Collect paragraphs until the next heading
      while (answerEl && !answerEl.matches('h2, h3, h4')) {
        if (answerEl.tagName === 'P') {
          answer += answerEl.textContent?.trim() + ' ';
        }
        answerEl = answerEl.nextElementSibling;
      }

      if (question && answer) {
        faqItems.push({ question, answer: answer.trim() });
      }
    });
  }

  // Only create FAQ schema if we found at least 2 FAQs
  if (faqItems.length >= 2) {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': faqItems.map(item => ({
        '@type': 'Question',
        'name': item.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': item.answer
        }
      }))
    };
  }

  return null;
};

/**
 * Generate Event schema based on page elements
 */
const generateEventSchema = (): any => {
  // Extract event details
  const name = document.querySelector('h1, .event-title')?.textContent?.trim() || document.title;
  const description = document.querySelector('.event-description, [itemprop="description"]')?.textContent?.trim() ||
                     document.querySelector('meta[name="description"]')?.getAttribute('content') || '';

  // Extract dates
  let startDate = '';
  let endDate = '';

  const dateEl = document.querySelector('.event-date, [itemprop="startDate"], time');
  if (dateEl) {
    startDate = dateEl.getAttribute('datetime') || dateEl.textContent?.trim() || '';
  }

  const endDateEl = document.querySelector('.event-end-date, [itemprop="endDate"]');
  if (endDateEl) {
    endDate = endDateEl.getAttribute('datetime') || endDateEl.textContent?.trim() || '';
  }

  // If no explicit dates found, try to detect it from text
  if (!startDate) {
    const contentText = document.body.textContent || '';
    const dateRegex = /(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})|(\w+ \d{1,2},? \d{4})/g;
    const dateMatches = contentText.match(dateRegex);

    if (dateMatches && dateMatches.length > 0) {
      const parsedDate = new Date(dateMatches[0]);
      if (!isNaN(parsedDate.getTime())) {
        startDate = parsedDate.toISOString();

        if (dateMatches.length > 1) {
          const parsedEndDate = new Date(dateMatches[1]);
          if (!isNaN(parsedEndDate.getTime())) {
            endDate = parsedEndDate.toISOString();
          }
        }
      }
    }
  }

  // If still no dates, default to future dates
  if (!startDate) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    startDate = tomorrow.toISOString();

    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    endDate = dayAfterTomorrow.toISOString();
  }

  // Default end date to start date if not found
  if (!endDate) endDate = startDate;

  // Extract location
  const locationEl = document.querySelector('.event-location, [itemprop="location"]');
  const locationName = locationEl?.textContent?.trim() || 'To be announced';

  // Determine if virtual event
  const isVirtual =
    document.body.textContent?.toLowerCase().includes('virtual event') ||
    document.body.textContent?.toLowerCase().includes('online event') ||
    document.body.textContent?.toLowerCase().includes('webinar') ||
    document.body.textContent?.toLowerCase().includes('zoom') ||
    document.querySelector('.virtual-event-badge, .online-event');

  // Extract price if available
  let price = null;
  let priceCurrency = 'USD';

  const priceEl = document.querySelector('.event-price, [itemprop="price"]');
  if (priceEl) {
    const priceText = priceEl.textContent || '';
    // Extract digits from price string
    const priceMatch = priceText.match(/[\d,.]+/);
    if (priceMatch) {
      price = parseFloat(priceMatch[0].replace(/,/g, ''));
    }

    // Extract free events
    if (priceText.toLowerCase().includes('free')) {
      price = 0;
    }
  }

  // Build schema
  const eventSchema: any = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    'name': name,
    'description': description,
    'startDate': startDate,
    'endDate': endDate,
    'eventStatus': 'https://schema.org/EventScheduled',
    'eventAttendanceMode': isVirtual
      ? 'https://schema.org/OnlineEventAttendanceMode'
      : 'https://schema.org/OfflineEventAttendanceMode'
  };

  // Add location
  if (isVirtual) {
    eventSchema.location = {
      '@type': 'VirtualLocation',
      'name': locationName
    };

    // Try to find URL for virtual events
    const eventUrlEl = document.querySelector('.virtual-event-link, .webinar-link');
    if (eventUrlEl && eventUrlEl.getAttribute('href')) {
      eventSchema.location.url = eventUrlEl.getAttribute('href');
    }
  } else {
    eventSchema.location = {
      '@type': 'Place',
      'name': locationName
    };

    // Try to extract address components
    const addressEl = document.querySelector('.event-address, [itemprop="address"]');
    if (addressEl) {
      const addressText = addressEl.textContent || '';

      // Attempt to parse address
      eventSchema.location.address = {
        '@type': 'PostalAddress',
        'streetAddress': addressText
      };

      // Try to extract structured address if available
      const streetEl = document.querySelector('[itemprop="streetAddress"]');
      const localityEl = document.querySelector('[itemprop="addressLocality"]');
      const regionEl = document.querySelector('[itemprop="addressRegion"]');
      const postalEl = document.querySelector('[itemprop="postalCode"]');
      const countryEl = document.querySelector('[itemprop="addressCountry"]');

      if (streetEl) eventSchema.location.address.streetAddress = streetEl.textContent?.trim();
      if (localityEl) eventSchema.location.address.addressLocality = localityEl.textContent?.trim();
      if (regionEl) eventSchema.location.address.addressRegion = regionEl.textContent?.trim();
      if (postalEl) eventSchema.location.address.postalCode = postalEl.textContent?.trim();
      if (countryEl) eventSchema.location.address.addressCountry = countryEl.textContent?.trim();
    }
  }

  // Add price/offers if available
  if (price !== null) {
    eventSchema.offers = {
      '@type': 'Offer',
      'price': price,
      'priceCurrency': priceCurrency,
      'availability': 'https://schema.org/InStock',
      'url': window.location.href
    };

    // Add availability status if found
    const availabilityEl = document.querySelector('.tickets-availability');
    if (availabilityEl) {
      const availabilityText = availabilityEl.textContent?.toLowerCase() || '';
      if (availabilityText.includes('sold out')) {
        eventSchema.offers.availability = 'https://schema.org/SoldOut';
      }
    }
  }

  // Add organizer if found
  const organizerEl = document.querySelector('.event-organizer, [itemprop="organizer"]');
  if (organizerEl) {
    eventSchema.organizer = {
      '@type': 'Organization',
      'name': organizerEl.textContent?.trim() || 'Event Organizer'
    };

    // Try to find organizer URL
    const organizerLinkEl = organizerEl.querySelector('a');
    if (organizerLinkEl && organizerLinkEl.getAttribute('href')) {
      eventSchema.organizer.url = organizerLinkEl.getAttribute('href');
    }
  }

  return eventSchema;
};

/**
 * Generate Recipe schema based on page elements
 */
const generateRecipeSchema = (): any => {
  // Extract recipe details
  const name = document.querySelector('h1, .recipe-title')?.textContent?.trim() || document.title;
  const description = document.querySelector('.recipe-description, [itemprop="description"]')?.textContent?.trim() ||
                     document.querySelector('meta[name="description"]')?.getAttribute('content') || '';

  const imageEl = document.querySelector('.recipe-image img, [itemprop="image"]') as HTMLImageElement;
  const imageUrl = imageEl?.src || document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';

  // Extract author
  const authorEl = document.querySelector('.recipe-author, [itemprop="author"]');
  const authorName = authorEl?.textContent?.trim() || 'Culinary Team';

  // Extract times
  let prepTime = '';
  let cookTime = '';
  let totalTime = '';

  const prepTimeEl = document.querySelector('.prep-time, [itemprop="prepTime"]');
  if (prepTimeEl) {
    prepTime = prepTimeEl.getAttribute('content') ||
              convertTimeToISO(prepTimeEl.textContent || '');
  }

  const cookTimeEl = document.querySelector('.cook-time, [itemprop="cookTime"]');
  if (cookTimeEl) {
    cookTime = cookTimeEl.getAttribute('content') ||
              convertTimeToISO(cookTimeEl.textContent || '');
  }

  const totalTimeEl = document.querySelector('.total-time, [itemprop="totalTime"]');
  if (totalTimeEl) {
    totalTime = totalTimeEl.getAttribute('content') ||
               convertTimeToISO(totalTimeEl.textContent || '');
  }

  // Extract ingredients
  const ingredients: string[] = [];
  const ingredientEls = document.querySelectorAll('.ingredient, [itemprop="recipeIngredient"], .ingredients li');
  ingredientEls.forEach(el => {
    const ingredient = el.textContent?.trim();
    if (ingredient) ingredients.push(ingredient);
  });

  // If no structured ingredients found, try to detect from headings and lists
  if (ingredients.length === 0) {
    const headings = document.querySelectorAll('h2, h3, h4');
    headings.forEach(heading => {
      if (heading.textContent?.toLowerCase().includes('ingredient')) {
        let nextEl = heading.nextElementSibling;
        while (nextEl && !nextEl.matches('h2, h3, h4')) {
          if (nextEl.tagName === 'UL' || nextEl.tagName === 'OL') {
            const listItems = nextEl.querySelectorAll('li');
            listItems.forEach(item => {
              const ingredient = item.textContent?.trim();
              if (ingredient) ingredients.push(ingredient);
            });
            break;
          }
          nextEl = nextEl.nextElementSibling;
        }
      }
    });
  }

  // Extract instructions
  const instructions: string[] = [];
  const instructionEls = document.querySelectorAll('.instruction, [itemprop="recipeInstructions"], .instructions li, .steps li');
  instructionEls.forEach(el => {
    const instruction = el.textContent?.trim();
    if (instruction) instructions.push(instruction);
  });

  // If no structured instructions found, try to detect from headings and lists
  if (instructions.length === 0) {
    const headings = document.querySelectorAll('h2, h3, h4');
    headings.forEach(heading => {
      if (heading.textContent?.toLowerCase().includes('instruction') ||
          heading.textContent?.toLowerCase().includes('direction') ||
          heading.textContent?.toLowerCase().includes('steps')) {
        let nextEl = heading.nextElementSibling;
        while (nextEl && !nextEl.matches('h2, h3, h4')) {
          if (nextEl.tagName === 'UL' || nextEl.tagName === 'OL') {
            const listItems = nextEl.querySelectorAll('li');
            listItems.forEach(item => {
              const instruction = item.textContent?.trim();
              if (instruction) instructions.push(instruction);
            });
            break;
          } else if (nextEl.tagName === 'P') {
            const instruction = nextEl.textContent?.trim();
            if (instruction) instructions.push(instruction);
          }
          nextEl = nextEl.nextElementSibling;
        }
      }
    });
  }

  // Extract yield
  let recipeYield = '';
  const yieldEl = document.querySelector('.recipe-yield, [itemprop="recipeYield"]');
  if (yieldEl) {
    recipeYield = yieldEl.textContent?.trim() || '';
  }

  if (!recipeYield) {
    // Look for phrases like "serves 4" or "makes 6 servings"
    const contentText = document.body.textContent || '';
    const yieldRegex = /(serves|servings:|makes|yield:)\s*(\d+)(\s*[-\u2013]\s*\d+)?(\s*servings)?/i;
    const yieldMatch = contentText.match(yieldRegex);
    if (yieldMatch) {
      recipeYield = yieldMatch[2] + ' servings';
    } else {
      recipeYield = '4 servings'; // Default
    }
  }

  // Get publication date if available
  let datePublished = '';
  const dateEl = document.querySelector('.published-date, [itemprop="datePublished"], time');
  if (dateEl) {
    datePublished = dateEl.getAttribute('datetime') || dateEl.textContent?.trim() || '';
  }
  if (!datePublished) {
    datePublished = new Date().toISOString();
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    'name': name,
    'description': description,
    'image': imageUrl,
    'author': {
      '@type': 'Person',
      'name': authorName
    },
    'datePublished': datePublished,
    'recipeYield': recipeYield,
    ...(prepTime && { 'prepTime': prepTime }),
    ...(cookTime && { 'cookTime': cookTime }),
    ...(totalTime && { 'totalTime': totalTime }),
    'recipeIngredient': ingredients.length > 0 ? ingredients : ['Ingredients not specified'],
    'recipeInstructions': instructions.map(instruction => ({
      '@type': 'HowToStep',
      'text': instruction
    }))
  };
};

/**
 * Helper function to convert time text to ISO 8601 duration format
 * @param timeText Text like "20 minutes" or "1 hour 30 minutes"
 * @returns ISO 8601 duration string like "PT20M" or "PT1H30M"
 */
const convertTimeToISO = (timeText: string): string => {
  if (!timeText) return '';

  const hours = timeText.match(/(\d+)\s*hour/i);
  const minutes = timeText.match(/(\d+)\s*min/i);

  let duration = 'PT';
  if (hours) duration += `${hours[1]}H`;
  if (minutes) duration += `${minutes[1]}M`;

  return duration || '';
};

/**
 * Generate JobPosting schema based on page elements
 */
const generateJobPostingSchema = (): any => {
  // Extract job details
  const title = document.querySelector('h1, .job-title')?.textContent?.trim() || document.title;
  const description = document.querySelector('.job-description, [itemprop="description"]')?.textContent?.trim() ||
                     document.querySelector('meta[name="description"]')?.getAttribute('content') || '';

  // Extract employer/company info
  const companyName = document.querySelector('.company-name, [itemprop="hiringOrganization"]')?.textContent?.trim() ||
                      'Sales Aholics Deals';
  const companyLogoEl = document.querySelector('.company-logo img') as HTMLImageElement;
  const companyLogo = companyLogoEl?.src || '/logo.svg';

  // Extract location
  const locationEl = document.querySelector('.job-location, [itemprop="jobLocation"]');
  const locationText = locationEl?.textContent?.trim() || '';

  // Extract other job details
  const salaryEl = document.querySelector('.job-salary, [itemprop="baseSalary"]');
  const employmentTypeEl = document.querySelector('.employment-type, [itemprop="employmentType"]');
  const jobBenefitsEl = document.querySelector('.job-benefits, [itemprop="jobBenefits"]');
  const workHoursEl = document.querySelector('.work-hours, [itemprop="workHours"]');

  // Parse date elements
  const datePostedEl = document.querySelector('.date-posted, [itemprop="datePosted"]');
  const datePosted = datePostedEl?.getAttribute('datetime') || datePostedEl?.textContent?.trim() || new Date().toISOString();

  const validThroughEl = document.querySelector('.valid-through, [itemprop="validThrough"]');
  let validThrough = validThroughEl?.getAttribute('datetime') || validThroughEl?.textContent?.trim() || '';

  // Default valid through to 30 days from posting if not specified
  if (!validThrough) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    validThrough = expiryDate.toISOString();
  }

  // Extract responsibilities and qualifications
  const responsibilities: string[] = [];
  const qualifications: string[] = [];

  // Try to find responsibility section
  document.querySelectorAll('h2, h3, h4').forEach(heading => {
    const headingText = heading.textContent?.toLowerCase() || '';
    if (headingText.includes('responsibilit') || headingText.includes('duties') || headingText.includes('what you will do')) {
      let nextEl = heading.nextElementSibling;
      while (nextEl && !nextEl.matches('h2, h3, h4')) {
        if (nextEl.tagName === 'UL' || nextEl.tagName === 'OL') {
          nextEl.querySelectorAll('li').forEach(item => {
            const text = item.textContent?.trim();
            if (text) responsibilities.push(text);
          });
          break;
        } else if (nextEl.tagName === 'P') {
          const text = nextEl.textContent?.trim();
          if (text) responsibilities.push(text);
        }
        nextEl = nextEl.nextElementSibling;
      }
    } else if (headingText.includes('qualification') || headingText.includes('requirement') || headingText.includes('skill') || headingText.includes('what we look for')) {
      let nextEl = heading.nextElementSibling;
      while (nextEl && !nextEl.matches('h2, h3, h4')) {
        if (nextEl.tagName === 'UL' || nextEl.tagName === 'OL') {
          nextEl.querySelectorAll('li').forEach(item => {
            const text = item.textContent?.trim();
            if (text) qualifications.push(text);
          });
          break;
        } else if (nextEl.tagName === 'P') {
          const text = nextEl.textContent?.trim();
          if (text) qualifications.push(text);
        }
        nextEl = nextEl.nextElementSibling;
      }
    }
  });

  // Build job posting schema
  const jobPostingSchema: any = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    'title': title,
    'description': description,
    'datePosted': datePosted,
    'validThrough': validThrough,
    'hiringOrganization': {
      '@type': 'Organization',
      'name': companyName,
      'logo': companyLogo
    }
  };

  // Add job location if found
  if (locationText) {
    jobPostingSchema.jobLocation = {
      '@type': 'Place',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': locationText
      }
    };

    // Check if remote work is mentioned
    const isRemote = locationText.toLowerCase().includes('remote') ||
                    document.body.textContent?.toLowerCase().includes('remote work') ||
                    document.body.textContent?.toLowerCase().includes('work from home');

    if (isRemote) {
      jobPostingSchema.jobLocationType = 'TELECOMMUTE';
    }
  }

  // Add salary information if available
  if (salaryEl) {
    const salaryText = salaryEl.textContent || '';
    const salaryMatch = salaryText.match(/\\$(\\d[\\d,]*(?:\\.\\d+)?)/);

    if (salaryMatch) {
      const salaryAmount = parseFloat(salaryMatch[1].replace(/,/g, ''));
      const isRange = salaryText.includes('-') || salaryText.includes('to');

      if (isRange) {
        const rangeMatch = salaryText.match(/\\$(\\d[\\d,]*(?:\\.\\d+)?)\\s*(?:-|to)\\s*\\$(\\d[\\d,]*(?:\\.\\d+)?)/);
        if (rangeMatch) {
          const minValue = parseFloat(rangeMatch[1].replace(/,/g, ''));
          const maxValue = parseFloat(rangeMatch[2].replace(/,/g, ''));

          jobPostingSchema.baseSalary = {
            '@type': 'MonetaryAmount',
            'currency': 'USD',
            'value': {
              '@type': 'QuantitativeValue',
              'minValue': minValue,
              'maxValue': maxValue,
              'unitText': salaryText.includes('/hr') || salaryText.includes('hour') ? 'HOUR' : 'YEAR'
            }
          };
        }
      } else {
        jobPostingSchema.baseSalary = {
          '@type': 'MonetaryAmount',
          'currency': 'USD',
          'value': {
            '@type': 'QuantitativeValue',
            'value': salaryAmount,
            'unitText': salaryText.includes('/hr') || salaryText.includes('hour') ? 'HOUR' : 'YEAR'
          }
        };
      }
    }
  }

  // Add employment type if available
  if (employmentTypeEl) {
    const employmentTypeText = employmentTypeEl.textContent?.toLowerCase() || '';
    let employmentType = 'FULL_TIME'; // Default

    if (employmentTypeText.includes('part-time') || employmentTypeText.includes('part time')) {
      employmentType = 'PART_TIME';
    } else if (employmentTypeText.includes('contract')) {
      employmentType = 'CONTRACTOR';
    } else if (employmentTypeText.includes('temp')) {
      employmentType = 'TEMPORARY';
    } else if (employmentTypeText.includes('intern')) {
      employmentType = 'INTERN';
    }

    jobPostingSchema.employmentType = employmentType;
  }

  // Add work hours if available
  if (workHoursEl) {
    jobPostingSchema.workHours = workHoursEl.textContent?.trim();
  }

  // Add job benefits if available
  if (jobBenefitsEl) {
    jobPostingSchema.jobBenefits = jobBenefitsEl.textContent?.trim();
  }

  // Add responsibilities and qualifications
  if (responsibilities.length > 0) {
    jobPostingSchema.responsibilities = responsibilities.join('\\n');
  }

  if (qualifications.length > 0) {
    jobPostingSchema.qualifications = qualifications.join('\\n');
  }

  return jobPostingSchema;
};

/**
 * Get pathSegments from URL for page type detection
 * Available in the global scope of the module
 */
const pathSegments = window.location.pathname.split('/').filter(Boolean);

/**
 * Interface for generated schema information
 */
export interface GeneratedSchemaInfo {
  schema: any;
  type: string;
  confidence: number; // 0-1 score indicating confidence in schema detection
  source: 'auto-detected' | 'template' | 'user-defined';
}

/**
 * Applies automatically generated schema to the page with enhanced features
 * @param validateSchema Whether to validate schema before applying (using PageSpeed Insights API)
 * @param url Optional URL to use for validation (defaults to window.location.href)
 * @returns Promise<GeneratedSchemaInfo | null> Schema information if applied, null otherwise
 */
export const applyAutoSchema = async (
  validateSchema = false,
  url?: string
): Promise<GeneratedSchemaInfo | null> => {
  const schema = detectPageTypeAndGenerateSchema();

  if (!schema) return null;

  // Determine schema type and confidence score
  const schemaType = Array.isArray(schema['@type']) ? schema['@type'][0] : schema['@type'];
  let confidence = 0.85; // Default high confidence

  // Adjust confidence based on detection method
  if (schemaType === 'WebSite') {
    confidence = 0.95; // Very high confidence for website schema
  } else if (['Event', 'Recipe'].includes(schemaType)) {
    // These types need more specific structure to be correctly identified
    confidence = 0.75;
  }

  // Validate schema if requested
  if (validateSchema) {
    try {
      // Create temporary schema for validation
      const tempSchema = document.createElement('script');
      tempSchema.type = 'application/ld+json';
      tempSchema.textContent = JSON.stringify(schema);
      document.head.appendChild(tempSchema);

      // Validate with PageSpeed Insights API
      const validationUrl = url || window.location.href;
      const validationResult = await testStructuredData(validationUrl);

      // Remove temporary schema
      tempSchema.remove();

      if (!validationResult.valid) {
        console.warn('Schema validation issues:', validationResult.issues);
        confidence *= 0.8; // Reduce confidence if validation issues
      }
    } catch (error) {
      console.error('Schema validation error:', error);
      // Continue despite validation errors, but reduce confidence
      confidence *= 0.7;
    }
  }

  // Apply the schema to the page
  const scriptElement = document.createElement('script');
  scriptElement.type = 'application/ld+json';
  scriptElement.textContent = JSON.stringify(schema);
  scriptElement.dataset.source = 'auto-generated';
  document.head.appendChild(scriptElement);

  return {
    schema,
    type: schemaType,
    confidence,
    source: 'auto-detected'
  };
};

/**
 * Gets information about all structured data on the page
 * @returns Array of schema information objects
 */
export const getAllPageSchemas = (): Array<{schema: any, element: HTMLElement}> => {
  const schemas: Array<{schema: any, element: HTMLElement}> = [];
  const scriptElements = document.querySelectorAll('script[type="application/ld+json"]');

  scriptElements.forEach(element => {
    try {
      const schema = JSON.parse(element.textContent || '{}');
      if (schema['@context']?.includes('schema.org')) {
        schemas.push({ schema, element: element as HTMLElement });
      }
    } catch (error) {
      console.error('Error parsing schema:', error);
    }
  });

  return schemas;
};
