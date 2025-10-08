import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Personalization Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('User Preference Tracking', () => {
    it('should track user search behavior', () => {
      const userBehavior = {
        userId: 'user-123',
        searchHistory: [
          { query: 'organic tomatoes', timestamp: new Date('2024-01-15T10:00:00Z') },
          { query: 'fresh lettuce', timestamp: new Date('2024-01-15T11:00:00Z') },
          { query: 'local carrots', timestamp: new Date('2024-01-15T12:00:00Z') }
        ],
        clickHistory: [
          { productId: 'prod-1', query: 'organic tomatoes', position: 1 },
          { productId: 'prod-5', query: 'fresh lettuce', position: 2 },
          { productId: 'prod-8', query: 'local carrots', position: 1 }
        ],
        purchaseHistory: [
          { productId: 'prod-1', category: 'vegetables', organic: true, price: 4.99 },
          { productId: 'prod-5', category: 'vegetables', organic: false, price: 2.99 }
        ]
      };

      expect(userBehavior.searchHistory).toHaveLength(3);
      expect(userBehavior.clickHistory).toHaveLength(3);
      expect(userBehavior.purchaseHistory).toHaveLength(2);
      
      // Extract preferences
      const organicPreference = userBehavior.purchaseHistory.filter(p => p.organic).length / 
                               userBehavior.purchaseHistory.length;
      expect(organicPreference).toBe(0.5);
    });

    it('should calculate category preferences', () => {
      const calculateCategoryPreferences = (purchaseHistory: any[]) => {
        const categoryCount: { [key: string]: number } = {};
        const totalPurchases = purchaseHistory.length;
        
        purchaseHistory.forEach(purchase => {
          categoryCount[purchase.category] = (categoryCount[purchase.category] || 0) + 1;
        });
        
        const preferences: { [key: string]: number } = {};
        Object.keys(categoryCount).forEach(category => {
          preferences[category] = categoryCount[category] / totalPurchases;
        });
        
        return preferences;
      };

      const purchases = [
        { category: 'vegetables', price: 4.99 },
        { category: 'vegetables', price: 3.99 },
        { category: 'fruits', price: 5.99 },
        { category: 'vegetables', price: 2.99 }
      ];

      const preferences = calculateCategoryPreferences(purchases);
      
      expect(preferences.vegetables).toBe(0.75);
      expect(preferences.fruits).toBe(0.25);
    });

    it('should track seasonal preferences', () => {
      const trackSeasonalPreferences = (purchaseHistory: any[]) => {
        const seasonalData: { [key: string]: string[] } = {};
        
        purchaseHistory.forEach(purchase => {
          const month = new Date(purchase.date).getMonth();
          const season = getSeason(month);
          
          if (!seasonalData[season]) {
            seasonalData[season] = [];
          }
          seasonalData[season].push(purchase.category);
        });
        
        return seasonalData;
      };

      const getSeason = (month: number): string => {
        if (month >= 2 && month <= 4) return 'spring';
        if (month >= 5 && month <= 7) return 'summer';
        if (month >= 8 && month <= 10) return 'fall';
        return 'winter';
      };

      const purchases = [
        { category: 'vegetables', date: '2024-03-15' }, // Spring
        { category: 'fruits', date: '2024-06-15' }, // Summer
        { category: 'vegetables', date: '2024-09-15' } // Fall
      ];

      const seasonalPrefs = trackSeasonalPreferences(purchases);
      
      expect(seasonalPrefs.spring).toContain('vegetables');
      expect(seasonalPrefs.summer).toContain('fruits');
      expect(seasonalPrefs.fall).toContain('vegetables');
    });
  });

  describe('Recommendation Algorithms', () => {
    it('should generate collaborative filtering recommendations', () => {
      const generateCollaborativeRecommendations = (
        userId: string,
        userSimilarities: { [key: string]: number },
        userPurchases: { [key: string]: string[] }
      ) => {
        const recommendations: string[] = [];
        const userProducts = new Set(userPurchases[userId] || []);
        
        // Find similar users
        const similarUsers = Object.entries(userSimilarities)
          .filter(([id, similarity]) => id !== userId && similarity > 0.5)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5);
        
        // Get products from similar users
        similarUsers.forEach(([similarUserId, similarity]) => {
          const similarUserProducts = userPurchases[similarUserId] || [];
          similarUserProducts.forEach(productId => {
            if (!userProducts.has(productId) && !recommendations.includes(productId)) {
              recommendations.push(productId);
            }
          });
        });
        
        return recommendations.slice(0, 10);
      };

      const userSimilarities = {
        'user-1': 0.8,
        'user-2': 0.6,
        'user-3': 0.3
      };

      const userPurchases = {
        'user-123': ['prod-1', 'prod-2'],
        'user-1': ['prod-1', 'prod-3', 'prod-4'],
        'user-2': ['prod-2', 'prod-5', 'prod-6'],
        'user-3': ['prod-7', 'prod-8']
      };

      const recommendations = generateCollaborativeRecommendations(
        'user-123',
        userSimilarities,
        userPurchases
      );
      
      expect(recommendations).toContain('prod-3');
      expect(recommendations).toContain('prod-5');
      expect(recommendations).not.toContain('prod-1'); // Already purchased
    });

    it('should generate content-based recommendations', () => {
      const generateContentBasedRecommendations = (
        userPreferences: any,
        products: any[]
      ) => {
        const recommendations = products
          .filter(product => {
            // Match category preferences
            const categoryMatch = userPreferences.categories.includes(product.category);
            
            // Match organic preference
            const organicMatch = !userPreferences.organicOnly || product.organic;
            
            // Match price range
            const priceMatch = product.price >= userPreferences.minPrice && 
                              product.price <= userPreferences.maxPrice;
            
            return categoryMatch && organicMatch && priceMatch;
          })
          .sort((a, b) => {
            // Score based on preference alignment
            let scoreA = 0, scoreB = 0;
            
            if (userPreferences.categories.includes(a.category)) scoreA += 2;
            if (userPreferences.categories.includes(b.category)) scoreB += 2;
            
            if (a.organic && userPreferences.organicPreference > 0.5) scoreA += 1;
            if (b.organic && userPreferences.organicPreference > 0.5) scoreB += 1;
            
            return scoreB - scoreA;
          })
          .slice(0, 10);
        
        return recommendations;
      };

      const userPreferences = {
        categories: ['vegetables', 'fruits'],
        organicOnly: false,
        organicPreference: 0.7,
        minPrice: 2,
        maxPrice: 15
      };

      const products = [
        { id: 'prod-1', category: 'vegetables', organic: true, price: 4.99 },
        { id: 'prod-2', category: 'vegetables', organic: false, price: 2.99 },
        { id: 'prod-3', category: 'dairy', organic: true, price: 5.99 },
        { id: 'prod-4', category: 'fruits', organic: true, price: 6.99 }
      ];

      const recommendations = generateContentBasedRecommendations(userPreferences, products);
      
      expect(recommendations).toHaveLength(3); // Excludes dairy
      expect(recommendations[0].organic).toBe(true); // Organic preference
    });

    it('should implement hybrid recommendation system', () => {
      const generateHybridRecommendations = (
        collaborativeRecs: string[],
        contentBasedRecs: string[],
        weights: { collaborative: number; contentBased: number }
      ) => {
        const hybridScores: { [key: string]: number } = {};
        
        // Score collaborative recommendations
        collaborativeRecs.forEach((productId, index) => {
          const score = (collaborativeRecs.length - index) / collaborativeRecs.length;
          hybridScores[productId] = (hybridScores[productId] || 0) + 
                                   score * weights.collaborative;
        });
        
        // Score content-based recommendations
        contentBasedRecs.forEach((productId, index) => {
          const score = (contentBasedRecs.length - index) / contentBasedRecs.length;
          hybridScores[productId] = (hybridScores[productId] || 0) + 
                                   score * weights.contentBased;
        });
        
        // Sort by hybrid score
        return Object.entries(hybridScores)
          .sort(([, a], [, b]) => b - a)
          .map(([productId]) => productId)
          .slice(0, 10);
      };

      const collaborativeRecs = ['prod-1', 'prod-2', 'prod-3'];
      const contentBasedRecs = ['prod-2', 'prod-4', 'prod-5'];
      const weights = { collaborative: 0.6, contentBased: 0.4 };

      const hybridRecs = generateHybridRecommendations(
        collaborativeRecs,
        contentBasedRecs,
        weights
      );
      
      expect(hybridRecs).toContain('prod-2'); // Should rank high (in both lists)
      expect(hybridRecs[0]).toBe('prod-2'); // Should be first due to being in both
    });
  });

  describe('Location-Based Personalization', () => {
    it('should provide location-based recommendations', () => {
      const getLocationBasedRecommendations = (
        userLocation: { lat: number; lon: number },
        products: any[],
        maxDistance: number = 50 // km
      ) => {
        const calculateDistance = (
          lat1: number, lon1: number,
          lat2: number, lon2: number
        ): number => {
          const R = 6371; // Earth's radius in km
          const dLat = (lat2 - lat1) * Math.PI / 180;
          const dLon = (lon2 - lon1) * Math.PI / 180;
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                   Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                   Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          return R * c;
        };

        return products
          .map(product => ({
            ...product,
            distance: calculateDistance(
              userLocation.lat, userLocation.lon,
              product.location.lat, product.location.lon
            )
          }))
          .filter(product => product.distance <= maxDistance)
          .sort((a, b) => a.distance - b.distance);
      };

      const userLocation = { lat: 37.7749, lon: -122.4194 }; // San Francisco
      const products = [
        {
          id: 'prod-1',
          name: 'Local Tomatoes',
          location: { lat: 37.7849, lon: -122.4094 } // ~1.5km away
        },
        {
          id: 'prod-2',
          name: 'Distant Apples',
          location: { lat: 40.7128, lon: -74.0060 } // NYC, ~4000km away
        }
      ];

      const localRecs = getLocationBasedRecommendations(userLocation, products, 50);
      
      expect(localRecs).toHaveLength(1);
      expect(localRecs[0].id).toBe('prod-1');
      expect(localRecs[0].distance).toBeLessThan(50);
    });

    it('should adjust recommendations based on delivery zones', () => {
      const filterByDeliveryZones = (
        products: any[],
        userZipCode: string,
        deliveryZones: { [key: string]: string[] }
      ) => {
        return products.filter(product => {
          const productZones = deliveryZones[product.farmId] || [];
          return productZones.includes(userZipCode);
        });
      };

      const products = [
        { id: 'prod-1', farmId: 'farm-1', name: 'Tomatoes' },
        { id: 'prod-2', farmId: 'farm-2', name: 'Lettuce' }
      ];

      const deliveryZones = {
        'farm-1': ['94102', '94103', '94104'],
        'farm-2': ['94105', '94106', '94107']
      };

      const availableProducts = filterByDeliveryZones(products, '94102', deliveryZones);
      
      expect(availableProducts).toHaveLength(1);
      expect(availableProducts[0].id).toBe('prod-1');
    });
  });

  describe('Temporal Personalization', () => {
    it('should provide time-based recommendations', () => {
      const getTimeBasedRecommendations = (
        currentHour: number,
        dayOfWeek: number,
        products: any[]
      ) => {
        return products.filter(product => {
          // Morning recommendations (6-11 AM)
          if (currentHour >= 6 && currentHour < 12) {
            return product.categories.includes('breakfast') || 
                   product.categories.includes('fresh');
          }
          
          // Lunch recommendations (11 AM - 2 PM)
          if (currentHour >= 11 && currentHour < 14) {
            return product.categories.includes('lunch') || 
                   product.categories.includes('quick');
          }
          
          // Dinner recommendations (5-9 PM)
          if (currentHour >= 17 && currentHour < 21) {
            return product.categories.includes('dinner') || 
                   product.categories.includes('cooking');
          }
          
          // Weekend recommendations
          if (dayOfWeek === 0 || dayOfWeek === 6) {
            return product.categories.includes('weekend') || 
                   product.categories.includes('special');
          }
          
          return true;
        });
      };

      const products = [
        { id: 'prod-1', categories: ['breakfast', 'fresh'] },
        { id: 'prod-2', categories: ['lunch', 'quick'] },
        { id: 'prod-3', categories: ['dinner', 'cooking'] },
        { id: 'prod-4', categories: ['weekend', 'special'] }
      ];

      const morningRecs = getTimeBasedRecommendations(8, 1, products); // 8 AM, Monday
      const lunchRecs = getTimeBasedRecommendations(12, 1, products); // 12 PM, Monday
      const weekendRecs = getTimeBasedRecommendations(14, 6, products); // 2 PM, Saturday

      expect(morningRecs.some(p => p.categories.includes('breakfast'))).toBe(true);
      expect(lunchRecs.some(p => p.categories.includes('lunch'))).toBe(true);
      expect(weekendRecs.some(p => p.categories.includes('weekend'))).toBe(true);
    });

    it('should implement seasonal recommendations', () => {
      const getSeasonalRecommendations = (
        currentMonth: number,
        products: any[]
      ) => {
        const seasonalProducts: { [key: string]: string[] } = {
          spring: ['asparagus', 'peas', 'strawberries', 'lettuce'],
          summer: ['tomatoes', 'corn', 'berries', 'zucchini'],
          fall: ['apples', 'pumpkins', 'squash', 'root_vegetables'],
          winter: ['citrus', 'cabbage', 'potatoes', 'stored_grains']
        };

        const getSeason = (month: number): string => {
          if (month >= 2 && month <= 4) return 'spring';
          if (month >= 5 && month <= 7) return 'summer';
          if (month >= 8 && month <= 10) return 'fall';
          return 'winter';
        };

        const currentSeason = getSeason(currentMonth);
        const seasonalItems = seasonalProducts[currentSeason];

        return products.filter(product => 
          seasonalItems.some(item => 
            product.name.toLowerCase().includes(item) ||
            product.categories.includes(item)
          )
        );
      };

      const products = [
        { id: 'prod-1', name: 'Fresh Strawberries', categories: ['fruits'] },
        { id: 'prod-2', name: 'Summer Tomatoes', categories: ['vegetables'] },
        { id: 'prod-3', name: 'Winter Squash', categories: ['vegetables'] },
        { id: 'prod-4', name: 'Spring Asparagus', categories: ['vegetables'] }
      ];

      const springRecs = getSeasonalRecommendations(3, products); // March
      const summerRecs = getSeasonalRecommendations(6, products); // June

      expect(springRecs.some(p => p.name.includes('Strawberries'))).toBe(true);
      expect(springRecs.some(p => p.name.includes('Asparagus'))).toBe(true);
      expect(summerRecs.some(p => p.name.includes('Tomatoes'))).toBe(true);
    });
  });

  describe('A/B Testing for Personalization', () => {
    it('should implement recommendation A/B testing', () => {
      const runRecommendationABTest = (
        userId: string,
        testConfig: {
          testName: string;
          variants: { [key: string]: any };
          trafficSplit: { [key: string]: number };
        }
      ) => {
        // Simple hash-based assignment
        const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const bucket = hash % 100;
        
        let cumulativeWeight = 0;
        for (const [variant, weight] of Object.entries(testConfig.trafficSplit)) {
          cumulativeWeight += weight;
          if (bucket < cumulativeWeight) {
            return {
              variant,
              config: testConfig.variants[variant]
            };
          }
        }
        
        // Fallback to first variant
        const firstVariant = Object.keys(testConfig.variants)[0];
        return {
          variant: firstVariant,
          config: testConfig.variants[firstVariant]
        };
      };

      const testConfig = {
        testName: 'recommendation_algorithm',
        variants: {
          control: { algorithm: 'collaborative', weight: 0.7 },
          treatment: { algorithm: 'hybrid', weight: 0.5 }
        },
        trafficSplit: {
          control: 50,
          treatment: 50
        }
      };

      const assignment1 = runRecommendationABTest('user-123', testConfig);
      const assignment2 = runRecommendationABTest('user-456', testConfig);

      expect(['control', 'treatment']).toContain(assignment1.variant);
      expect(['control', 'treatment']).toContain(assignment2.variant);
      expect(assignment1.config).toBeDefined();
    });

    it('should track A/B test metrics', () => {
      const trackABTestMetrics = (
        userId: string,
        testName: string,
        variant: string,
        event: string,
        metadata?: any
      ) => {
        return {
          userId,
          testName,
          variant,
          event,
          timestamp: new Date(),
          metadata: metadata || {}
        };
      };

      const clickEvent = trackABTestMetrics(
        'user-123',
        'recommendation_algorithm',
        'treatment',
        'recommendation_click',
        { productId: 'prod-1', position: 2 }
      );

      expect(clickEvent.testName).toBe('recommendation_algorithm');
      expect(clickEvent.variant).toBe('treatment');
      expect(clickEvent.event).toBe('recommendation_click');
      expect(clickEvent.metadata.productId).toBe('prod-1');
    });
  });

  describe('Privacy and Data Protection', () => {
    it('should implement privacy-preserving personalization', () => {
      const anonymizeUserData = (userData: any) => {
        const anonymized = { ...userData };
        
        // Remove direct identifiers
        delete anonymized.email;
        delete anonymized.phone;
        delete anonymized.address;
        
        // Hash user ID
        anonymized.userId = `hash_${userData.userId.split('').reverse().join('')}`;
        
        // Generalize location data
        if (anonymized.location) {
          anonymized.location = {
            region: anonymized.location.region,
            // Remove precise coordinates
          };
        }
        
        // Aggregate temporal data
        if (anonymized.purchaseHistory) {
          anonymized.purchaseHistory = anonymized.purchaseHistory.map((purchase: any) => ({
            category: purchase.category,
            priceRange: getPriceRange(purchase.price),
            month: new Date(purchase.date).getMonth()
            // Remove exact date and price
          }));
        }
        
        return anonymized;
      };

      const getPriceRange = (price: number): string => {
        if (price < 5) return 'low';
        if (price < 15) return 'medium';
        return 'high';
      };

      const userData = {
        userId: 'user-123',
        email: 'user@example.com',
        phone: '555-1234',
        location: { lat: 37.7749, lon: -122.4194, region: 'CA' },
        purchaseHistory: [
          { category: 'vegetables', price: 4.99, date: '2024-01-15' }
        ]
      };

      const anonymized = anonymizeUserData(userData);

      expect(anonymized.email).toBeUndefined();
      expect(anonymized.userId).not.toBe('user-123');
      expect(anonymized.location.lat).toBeUndefined();
      expect(anonymized.purchaseHistory[0].price).toBeUndefined();
      expect(anonymized.purchaseHistory[0].priceRange).toBe('low');
    });

    it('should implement consent-based personalization', () => {
      const getPersonalizationLevel = (userConsent: any) => {
        const levels = {
          none: 0,
          basic: 1,
          enhanced: 2,
          full: 3
        };

        if (!userConsent.analytics) return levels.none;
        if (!userConsent.personalization) return levels.basic;
        if (!userConsent.crossSite) return levels.enhanced;
        return levels.full;
      };

      const generateConsentBasedRecommendations = (
        userConsent: any,
        products: any[]
      ) => {
        const level = getPersonalizationLevel(userConsent);
        
        switch (level) {
          case 0: // No personalization
            return products.slice(0, 5); // Generic top products
          case 1: // Basic - category only
            return products.filter(p => p.category === 'popular').slice(0, 8);
          case 2: // Enhanced - with purchase history
            return products.filter(p => p.trending || p.seasonal).slice(0, 10);
          case 3: // Full personalization
            return products; // All personalization features
          default:
            return products.slice(0, 5);
        }
      };

      const fullConsent = {
        analytics: true,
        personalization: true,
        crossSite: true
      };

      const limitedConsent = {
        analytics: true,
        personalization: false,
        crossSite: false
      };

      const products = Array.from({ length: 15 }, (_, i) => ({ 
        id: `prod-${i}`, 
        category: i < 5 ? 'popular' : 'other',
        trending: i % 3 === 0,
        seasonal: i % 4 === 0
      }));

      const fullRecs = generateConsentBasedRecommendations(fullConsent, products);
      const limitedRecs = generateConsentBasedRecommendations(limitedConsent, products);

      expect(fullRecs).toHaveLength(15);
      expect(limitedRecs).toHaveLength(5);
    });
  });
});