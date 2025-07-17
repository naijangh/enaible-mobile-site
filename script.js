// Global storage key for user data
const USER_DATA_KEY = 'enaible_user_data';
const SEARCH_RESULTS_KEY = 'enaible_search_results';

// Utility functions
const Storage = {
  save: (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },
  
  load: (key) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return null;
    }
  },
  
  clear: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};

// Collect and store user data from onboarding.html
function handleOnboardingSubmit() {
  const form = document.getElementById('onboardingForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const userData = {
      measurements: {
        height: document.getElementById('height')?.value || '',
        weight: document.getElementById('weight')?.value || '',
        chest: document.getElementById('chest')?.value || '',
        waist: document.getElementById('waist')?.value || '',
        inseam: document.getElementById('inseam')?.value || ''
      },
      sizes: {
        nike: document.getElementById('nikeSize')?.value || '',
        adidas: document.getElementById('adidasSize')?.value || '',
        levis: document.getElementById('levisSize')?.value || '',
        hm: document.getElementById('hmSize')?.value || '',
        zara: document.getElementById('zaraSize')?.value || ''
      },
      fitPreference: document.getElementById('fitPreference')?.value || ''
    };
    
    Storage.save(USER_DATA_KEY, userData);
    console.log('Onboarding data saved:', userData);
  });
}

// Collect and store filter data from filters.html
function handleFiltersSubmit() {
  const form = document.getElementById('filtersForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const filterData = {
      weather: document.getElementById('weather')?.value || '',
      occasion: document.getElementById('occasion')?.value || '',
      location: document.getElementById('location')?.value || ''
    };
    
    // Load existing user data and merge with filters
    const existingData = Storage.load(USER_DATA_KEY) || {};
    const updatedData = { ...existingData, filters: filterData };
    
    Storage.save(USER_DATA_KEY, updatedData);
    console.log('Filter data saved:', updatedData);
  });
}

// Handle search submission and API call
async function handleSearchSubmit() {
  const form = document.getElementById('searchForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const searchQuery = document.getElementById('searchInput')?.value || '';
    
    // Load all stored user data
    const userData = Storage.load(USER_DATA_KEY) || {};
    const searchData = {
      ...userData,
      searchQuery: searchQuery
    };
    
    console.log('Sending search request:', searchData);
    
    try {
      // Show loading state
      const searchButton = form.querySelector('a[href="loading.html"]');
      if (searchButton) {
        searchButton.textContent = 'Searching...';
        searchButton.classList.add('opacity-50');
      }
      
      // Send POST request to API
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const results = await response.json();
      
      // Store search results
      Storage.save(SEARCH_RESULTS_KEY, results);
      
      console.log('Search results received:', results);
      
      // Navigate to loading page
      window.location.href = 'loading.html';
      
    } catch (error) {
      console.error('Search request failed:', error);
      alert('Search failed. Please try again.');
      
      // Reset button state
      const searchButton = form.querySelector('a[href="loading.html"]');
      if (searchButton) {
        searchButton.textContent = 'Search';
        searchButton.classList.remove('opacity-50');
      }
    }
  });
}

// Handle style preferences on loading.html
function handleStylePreferences() {
  const styleButtons = document.querySelectorAll('.style-btn');
  
  styleButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      
      const style = button.dataset.style;
      const preference = button.dataset.preference;
      
      // Load existing preferences
      const userData = Storage.load(USER_DATA_KEY) || {};
      const stylePreferences = userData.stylePreferences || {};
      
      // Update preference
      stylePreferences[style] = preference;
      
      // Save updated data
      const updatedData = { ...userData, stylePreferences };
      Storage.save(USER_DATA_KEY, updatedData);
      
      console.log('Style preference saved:', { style, preference });
      
      // Visual feedback
      button.classList.add('ring-2', 'ring-blue-500');
    });
  });
}

// Display search results on results.html
function displaySearchResults() {
  const resultsContainer = document.getElementById('results');
  if (!resultsContainer) return;
  
  // Load search results from localStorage
  const results = Storage.load(SEARCH_RESULTS_KEY);
  
  if (!results || !results.products) {
    resultsContainer.innerHTML = `
      <div class="col-span-full text-center py-8">
        <p class="text-gray-500">No results found. Please try a different search.</p>
      </div>
    `;
    return;
  }
  
  // Clear existing content
  resultsContainer.innerHTML = '';
  
  // Create and append product cards
  results.products.forEach(product => {
    const productCard = createProductCard(product);
    resultsContainer.innerHTML += productCard;
  });
  
  console.log('Search results displayed:', results.products.length, 'products');
}

// Create product card HTML
function createProductCard(product) {
  return `
    <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div class="relative">
        <img src="${product.image || 'https://placehold.co/300x300?text=Product'}" 
             alt="${product.name}" 
             class="w-full h-64 object-cover" />
        ${product.pickupAvailable ? 
          '<span class="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">Pickup Available</span>' : 
          '<span class="absolute top-2 right-2 bg-gray-500 text-white text-xs px-2 py-1 rounded-full">Online Only</span>'
        }
      </div>
      <div class="p-4">
        <h3 class="font-semibold text-lg mb-2">${product.name}</h3>
        <p class="text-2xl font-bold text-blue-600 mb-3">${product.price}</p>
        ${product.pickupAvailable ? 
          `<p class="text-sm text-gray-600 mb-3">📍 ${product.pickupLocation}</p>` : 
          '<p class="text-sm text-gray-500 mb-3">Shipping only</p>'
        }
        <button class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
          ${product.pickupAvailable ? 'Reserve for Pickup' : 'Add to Cart'}
        </button>
      </div>
    </div>
  `;
}

// Initialize page-specific functionality
document.addEventListener('DOMContentLoaded', function() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  console.log('Initializing page:', currentPage);
  
  switch (currentPage) {
    case 'onboarding.html':
      handleOnboardingSubmit();
      break;
      
    case 'filters.html':
      handleFiltersSubmit();
      break;
      
    case 'search.html':
      handleSearchSubmit();
      break;
      
    case 'loading.html':
      handleStylePreferences();
      break;
      
    case 'results.html':
      displaySearchResults();
      break;
      
    default:
      console.log('No specific initialization for page:', currentPage);
  }
});

// Export functions for potential external use
window.EnaibleApp = {
  Storage,
  handleOnboardingSubmit,
  handleFiltersSubmit,
  handleSearchSubmit,
  handleStylePreferences,
  displaySearchResults,
  createProductCard
};
