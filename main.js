(function() {

  // Set on initialization.
  var config;

  // Length of time we can use an ad after we preload it.
  var AD_EXPIRATION_SECONDS = 15;
  var MOCK_NETW0RK_DELAY_MS = 1200;

  // Simple interface to localStorage.
  var store = {
    _get: function(key) {
      return JSON.parse(localStorage.getItem(key));
    },

    _set: function(key, val) {
      localStorage.setItem(key, JSON.stringify(val));
    },

    _cacheKey: 'leopard_ad_cache',

    getCachedAds: function() {
      return this._get(this._cacheKey);
    },

    setCachedAds: function(adData) {
      return this._set(this._cacheKey, adData);
    },
  };

  function formatAdData(adResponse) {
    var formattedAds = {};
    for (var slotId in adResponse.ads) {
      var adData = adResponse.ads[slotId];
      formattedAds[slotId] = {
        ad: adData.ad,
        fetchedDate: new Date(),
        slotId: slotId,
      };
    }
    return formattedAds;
  }

  // Return the ad if one exists in the cache and hasn't expired;
  // otherwise, return null.
  function getAdFromCache(slotId) {
    var cachedAds = store.getCachedAds();
    if (!cachedAds || !cachedAds[slotId]) {
      console.log('No matching ad in cache for placement ' + slotId + '.');
      return;
    }

    var ad = cachedAds[slotId];
    var adFetchedTime = (new Date(ad.fetchedDate)).getTime();
    var secondsAgoAdFetched = ((new Date()).getTime() - adFetchedTime) / 1000;
    if (secondsAgoAdFetched > AD_EXPIRATION_SECONDS) {
      console.log('Ad in cache is expired for placement ' + slotId + '.');
      return;
    }

    console.log('Found cached ad for placement ' + slotId + '.');

    // Delete ad from the cache.
    delete cachedAds[slotId];
    store.setCachedAds(cachedAds);

    return ad;
  }

  // For demo only.
  function mockAdResponse(adUnits) {

    var nowStr = new Date().toTimeString().split(" ")[0];
    var ads = {
      'div-gpt-ad-1464385742501-0': {
        ad: '<div><div class="fetched-at">Fetched at: ' + nowStr + '</div><img src="http://goinkscape.com/wp-content/uploads/2015/07/leaderboard-ad-final.png"</img></div>',
      },
      'div-gpt-ad-1464385677836-0': {
        ad: '<div><div class="fetched-at">Fetched at: ' + nowStr + '</div><img src="http://www.guardyourhealth.com/wp-content/uploads/2013/07/300x250_GYH_WebBanner.jpg"</img></div>',
      },
    };

    var adResponse = {
      ads: {},
    };
    adUnits.forEach(function(adUnit) {
      adResponse.ads[adUnit.code] = ads[adUnit.code];
    });

    return adResponse;
  }

  // For demo only.
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  async function fetchAdsFromRemote(adUnits) {
    var adResponse = await mockAdResponse(adUnits);

    // Fake network delay.
    await sleep(MOCK_NETW0RK_DELAY_MS);

    var ads = formatAdData(adResponse);
    return ads;
  }

  // adData is the object of formatted ad data.
  function renderAd(adData) {
    var container = document.getElementById(adData.slotId);
    container.innerHTML = adData.ad;
  }

  async function fetchAds() {
    console.log('Fetching ads.');

    var adUnitsToFetch = [];

    // Check if any matching ads exist in cache before fetching from remote.
    config.adUnits.forEach(function(adUnit) {
      var cachedAd = getAdFromCache(adUnit.code);
      if (cachedAd) {
        renderAd(cachedAd);
      } else {
        adUnitsToFetch.push(adUnit);
      }
    });
    
    if (adUnitsToFetch.length) {
      console.log('Fetching ads for uncached placements...');
    }
    var ads = await fetchAdsFromRemote(adUnitsToFetch);
    for (var key in ads) {
      renderAd(ads[key]);
    }

    // Preload all ads for next time.
    console.log('Preloading ads...');
    var preloadedAds = await fetchAdsFromRemote(config.adUnits);
    console.log('Ads successfully preloaded.');
    store.setCachedAds(preloadedAds);
  }

  function main() {

    // No config set, so don't do anything.
    if (!window.leopard || !window.leopard.config) {
      console.warn('Leopard config not set.');
      return;
    }

    if (!window.leopard.config.adUnits || !window.leopard.config.adUnits.length) {
      console.warn('No ad units configured in Leopard.');
      return;
    }

    config = window.leopard.config;
    fetchAds();
  }

  main();

})();
