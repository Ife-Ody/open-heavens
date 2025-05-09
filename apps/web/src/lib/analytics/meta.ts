export const sendMetaViewEvent = (path: string) => {
  if (process.env.NODE_ENV === "production") {
    const pixelId = process.env.META_PIXEL_ID;
    const token = process.env.META_PIXEL_TOKEN;
    
    if (!pixelId || !token) {
      console.error('Missing META_PIXEL_ID or META_PIXEL_TOKEN environment variables');
      return;
    }
    
    const apiVersion = 'v17.0'; // You may need to adjust this version
    const url = `https://graph.facebook.com/${apiVersion}/${pixelId}/events?access_token=${token}`;
    
    // Get client information from browser
    const userAgent = window.navigator.userAgent;
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Try to get country information from navigator.language
    const language = window.navigator.language || '';
    const countryCode = language.includes('-') ? language.split('-')[1] : null;
    
    // Get browser timezone information
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Get document referrer if available
    const referrer = document.referrer || null;
    
    const eventData = {
      data: [
        {
          event_name: "view_content",
          event_time: currentTime,
          action_source: "website",
          event_source_url: path,
          attribution_data: {
            attribution_share: "0.3"
          },
          original_event_data: {
            event_name: "Purchase",
            event_time: currentTime + 51
          },
          user_data: {
            country: [countryCode],
            ct: [timezone],
            client_ip_address: null, // IP is automatically captured by Meta
            client_user_agent: userAgent,
            fbp: getCookieValue('_fbp') || null, // Facebook Browser ID
            fbc: getCookieValue('_fbc') || null, // Facebook Click ID
            external_id: getExternalUserId(),
            subscription_id: getSubscriptionId(),
            lead_id: getLeadId(),
            em: getHashedEmail()
          },
          custom_data: {
            referrer: referrer,
            screen_width: window.screen.width,
            screen_height: window.screen.height,
            viewport_width: window.innerWidth,
            viewport_height: window.innerHeight
          }
        }
      ]
    };
    
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    })
    .then(response => {
      if (!response.ok) {
        return response.text().then(text => {
          console.error('Failed to send Meta Pixel event:', text);
        });
      }
      return response.json();
    })
    .then(data => {
      console.debug('Meta Pixel event sent successfully:', data);
    })
    .catch(error => {
      console.error('Error sending Meta Pixel event:', error);
    });
  }
};

// Helper functions to get user data
const getCookieValue = (name: string): string | null => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
};

const getExternalUserId = (): string | null => {
  // Implement based on your user identification system
  // For example, get user ID from localStorage or your auth system
  return localStorage.getItem('userId') || null;
};

const getSubscriptionId = (): string | null => {
  // Get subscription ID if user has a subscription
  return localStorage.getItem('subscriptionId') || null;
};

const getLeadId = (): string | null => {
  // Get lead ID if relevant
  return localStorage.getItem('leadId') || null;
};

const getHashedEmail = (): string | null => {
  // Get hashed email if available (Meta requires hashing for PII)
  // Note: In production, you should hash the email with SHA-256
  const email = localStorage.getItem('userEmail');
  return email ? hashString(email) : null;
};

// Simple hash function (for demonstration - use a proper SHA-256 in production)
const hashString = (str: string): string => {
  // This is a placeholder - in production use:
  // return CryptoJS.SHA256(str.trim().toLowerCase()).toString();
  return btoa(str.trim().toLowerCase()); // Base64 for example only
};