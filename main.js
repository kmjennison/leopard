(function() {

  // Set on initialization.
  var config;

  function mockAdResponse() {
    return {
      ads: {
        'div-gpt-ad-1464385742501-0': {
          ad: '<div><img src="http://goinkscape.com/wp-content/uploads/2015/07/leaderboard-ad-final.png"</img></div>',
        },
        'div-gpt-ad-1464385677836-0': {
          ad: '<div><img src="http://www.guardyourhealth.com/wp-content/uploads/2013/07/300x250_GYH_WebBanner.jpg"</img></div>',
        },
      }
    }
  }

  function renderAds(adResponse) {
    if (!adResponse || !adResponse.ads) {
      console.log('No ad responses.');
      return;
    }
    for (var slotId in adResponse.ads) {
      var container = document.getElementById(slotId);
      container.innerHTML = adResponse.ads[slotId].ad;
    }
  }

  function fetchAds() {

    // TODO: check if any matching ads exist in cache before fetching
    // from remote.
    console.log('Fetching ads.');

    var adResponse = mockAdResponse();
    renderAds(adResponse);
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
