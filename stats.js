
//Initialise map
//-------------------------------------------------------------------------------------------------------------
// https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio (if youhave to work wit canvas)
var pixel_ratio = parseInt(window.devicePixelRatio) || 1;
// leaflet max zoom
var max_zoom = 16;
// Width and height of tiles (reduce number of tiles and increase tile size)
var tile_size = 512;
// zoom to italy (lat,lon, zoom)
var map = L.map('map', {
  zoomControl: false
}).setView([0, 10], 4);


var busy_tabs ={ spinner: "pulsar",color:'#ff5722',background:'#111314c4'};

var busy_wdpa ={ color:'#0a6519',background:'#111314c4'};

// Define basemaps
// choose one from https://leaflet-extras.github.io/leaflet-providers/preview/
var WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
 attribution: ''
}).addTo(map);

var light  =  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
  subdomains: 'abcd',
  opacity: 0.8,
	maxZoom: 19
}).addTo(map);


// Lable pane (no additional library required)
var topPane = map.createPane('leaflet-top-pane', map.getPanes().mapPane);
var topLayer =  L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_only_labels/{z}/{x}/{y}.png', {
	subdomains: 'abcd',
  opacity: 1,
	maxZoom: 19
}).addTo(map);

var mask = L.tileLayer('https://geospatial.jrc.ec.europa.eu/geoserver/gwc/service/tms/1.0.0/africa_platform:world_flat_no_africa_no_eez_@EPSG:900913@png/{z}/{x}/{y}.png', {tms: true,zIndex: 40, opacity: 1}).addTo(map)
  topPane.appendChild(topLayer.getContainer());
  topLayer.setZIndex(2);
  topPane.appendChild(mask.getContainer());
  mask.setZIndex(3);
topLayer.setZIndex(2);
var url = 'https://geospatial.jrc.ec.europa.eu/geoserver/africa_platform/wms';
var country_mask=L.tileLayer.wms(url, {
  layers: 'africa_platform:gaul_eez_dissolved',
  transparent: true,
  format: 'image/png',
  opacity:'0.7',
  styles:'africa_platform_mask_country2',
  zIndex: 9
}).addTo(map);



 //---------------------------------------------------------------
 // sites WMS GEOSERVER LAYER
 //---------------------------------------------------------------

 var url = 'https://geospatial.jrc.ec.europa.eu/geoserver/econservation/wms';
 var sites=L.tileLayer.wms(url, {
 layers: 'econservation:mt_190_site_project_country_wdpa',
 transparent: true,
 format: 'image/png',
 opacity:'0.8',
 zIndex: 50
 });

 var url = 'https://geospatial.jrc.ec.europa.eu/geoserver/econservation/wms';
 var sites_hi=L.tileLayer.wms(url, {
 layers: 'econservation:mt_190_site_project_country_wdpa',
 transparent: true,
 format: 'image/png',
 styles:'point_selected',
 opacity:'1',
 zIndex: 32
 }).addTo(map);
 sites_hi.setParams({CQL_FILTER:"site_country_iso2 LIKE ''"});

 sites.setParams({CQL_FILTER:"site_id >0"});
 sites.on("load",function() {$(".card-image_sites").busyLoad("hide", {animation: "fade"});});

$('.add_sites').click(function(event) {
  if (map.hasLayer(sites)) {
    map.removeLayer(sites);
    $( ".sites_main" ).find( "#show_pa" ).hide();
    $(".card-image_sites").busyLoad("hide", {animation: "fade"});
    $(this).css("color", "#ffffff");
   
}else{
  sites.addTo(map);
  $(".card-image_sites").busyLoad("show", busy_tabs);
  $( ".sites_main" ).find( "#show_pa" ).show();
  $(this).css("color", "#b2610e");
}
});


 //---------------------------------------------------------------
 // countries WMS GEOSERVER LAYER
 //---------------------------------------------------------------

 var Country_layer=L.tileLayer.wms(url, {
  layers: 'econservation:mt_120_country_budget_project_geo',
  transparent: true,
  format: 'image/png',
  opacity:'0.8',
  zIndex: 48
  });
 Country_layer.setParams({CQL_FILTER:"sum_budget >0"});

 var Country_layer_hi=L.tileLayer.wms(url, {
  layers: 'econservation:mt_120_country_budget_project_geo',
  transparent: true,
  styles:'polygon_selected',
  format: 'image/png',
  opacity:'0.8',
  zIndex: 60
  }).addTo(map);
 Country_layer_hi.setParams({CQL_FILTER:"iso2 LIKE ''"});





//---------------------------------------------------------------
//  sites LAYER - GET FEATUREINFO
//---------------------------------------------------------------

function getFeatureInfoUrl_c(map, layer, latlng, params) {
  if (layer.wmsParams.layers=="econservation:mt_120_country_budget_project_geo")
      {
         var point2 = map.latLngToContainerPoint(latlng, map.getZoom()),
             size2 = map.getSize(),
             bounds2 = map.getBounds(),
             sw2 = bounds2.getSouthWest(),
             ne2 = bounds2.getNorthEast();
         var defaultParams2 = {
             request: 'GetFeatureInfo',
             service: 'WMS',
             srs: 'EPSG:4326',
             styles: '',
             version: layer._wmsVersion,
             format: layer.options.format,
             bbox: bounds2.toBBoxString(),
             height: size2.y,
             width: size2.x,
             layers: layer.options.layers,
             info_format: 'text/javascript'
         };
       params = L.Util.extend(defaultParams2, params || {});
       params[params.version === '1.3.0' ? 'i' : 'x'] = point2.x;
       params[params.version === '1.3.0' ? 'j' : 'y'] = point2.y;
       return layer._url + L.Util.getParamString(params, layer._url, true);
      }
  }
  
  
  
  function getFeatureInfoUrl_sites(map, layer, latlng, params) {
  if (layer.wmsParams.layers=="econservation:mt_190_site_project_country_wdpa")
  {
       var point1 = map.latLngToContainerPoint(latlng, map.getZoom()),
           size1 = map.getSize(),
           bounds1 = map.getBounds(),
           sw1 = bounds1.getSouthWest(),
           ne1 = bounds1.getNorthEast();
       var defaultParams1 = {
           request: 'GetFeatureInfo',
           service: 'WMS',
           srs: 'EPSG:4326',
           styles: '',
           version: layer._wmsVersion,
           format: layer.options.format,
           bbox: bounds1.toBBoxString(),
           height: size1.y,
           width: size1.x,
           layers: layer.options.layers,
           info_format: 'text/javascript'
       };
       params = L.Util.extend(defaultParams1, params || {});
       params[params.version === '1.3.0' ? 'i' : 'x'] = point1.x;
       params[params.version === '1.3.0' ? 'j' : 'y'] = point1.y;
       return layer._url + L.Util.getParamString(params, layer._url, true);
   }
  
  }
  function getFeatureInfoUrl_wdpa(map, layer, latlng, params) {
  if (layer.wmsParams.layers=="econservation:mt_160_wdpa_budget_project_geo_poly")
  {
       var point3 = map.latLngToContainerPoint(latlng, map.getZoom()),
           size3 = map.getSize(),
           bounds3 = map.getBounds(),
           sw3 = bounds3.getSouthWest(),
           ne3 = bounds3.getNorthEast();
       var defaultParams1 = {
           request: 'GetFeatureInfo',
           service: 'WMS',
           srs: 'EPSG:4326',
           styles: '',
           version: layer._wmsVersion,
           format: layer.options.format,
           bbox: bounds3.toBBoxString(),
           height: size3.y,
           width: size3.x,
           layers: layer.options.layers,
           info_format: 'text/javascript'
       };
       params = L.Util.extend(defaultParams1, params || {});
       params[params.version === '1.3.0' ? 'i' : 'x'] = point3.x;
       params[params.version === '1.3.0' ? 'j' : 'y'] = point3.y;
       return layer._url + L.Util.getParamString(params, layer._url, true);
   }
  
  }
  
  // ONCLICK RESPONSE ON HIGLIGHTED sites
  function hi_highcharts_sites(info,latlng){
    var site_id=info['site_id'];
    var site_name=info['site_name'];
    var popupContentSite = '<center><a href="https://econservation.jrc.ec.europa.eu/site/'+site_id+'">'+site_name+'</a></center><hr>';
    var popupSite = L.popup()
         .setLatLng([latlng.lat, latlng.lng])
         .setContent(popupContentSite)
         .openOn(map);
  }


  map.on('click', function(e) {
    if (map.hasLayer(sites)) {
     var latlng_sites= e.latlng;
     var sites_url = getFeatureInfoUrl_sites(
                   map,
                   sites,
                   e.latlng,
                   {
                     'info_format': 'text/javascript',  //it allows us to get a jsonp
                     'propertyName': 'site_id,site_name',
                     'query_layers': 'econservation:mt_190_site_project_country_wdpa',
                     'format_options':'callback:getJson'
                   }
               );
                $.ajax({
                        jsonp: false,
                        url: sites_url,
                        dataType: 'jsonp',
                        jsonpCallback: 'getJson',
                        success: handleJson_featureRequest_sites
                      });
                   function handleJson_featureRequest_sites(data_site)
                   {
                      if (typeof data_site.features[0]!=='undefined')
                          {
                             var prop_sites=data_site.features[0].properties;
                             var filter="site_id='"+prop_sites['site_id']+"'";
                             sites_hi.setParams({CQL_FILTER:filter});
                             hi_highcharts_sites(prop_sites,latlng_sites);
                       }
                       else {
                       }
                   }
               }else if (map.hasLayer(Country_layer)){
                 var latlng_country= e.latlng;
                 var country_url = getFeatureInfoUrl_c(
                               map,
                               Country_layer,
                               e.latlng,
                               {
                                 'info_format': 'text/javascript',  //it allows us to get a jsonp
                                 'propertyName': 'iso2,country_name,sum_budget,project_numb',
                                 'query_layers': 'econservation:mt_120_country_budget_project_geo',
                                 'format_options':'callback:getJson'
                               }
                           );
                            $.ajax({
                                    jsonp: false,
                                    url: country_url,
                                    dataType: 'jsonp',
                                    jsonpCallback: 'getJson',
                                    success: handleJson_featureRequest_country
                                  });
                               function handleJson_featureRequest_country(data_country)
                               {
                                  if (typeof data_country.features[0]!=='undefined')
                                      {
                                         var prop_country=data_country.features[0].properties;
                                         var filter="iso2='"+prop_country['iso2']+"'";
                                         Country_layer_hi.setParams({CQL_FILTER:filter});
                                         hi_highcharts_country(prop_country,latlng_country);
                                   }
                                   else {
                                   }
                               }
               }else {
                 console.log('no layer');
               }
     });
   







// 	oilpalm

var oil_palm_p = L.tileLayer('https://geospatial.jrc.ec.europa.eu/geoserver/gwc/service/tms/1.0.0/oilpalm:oilpalm_probability@EPSG:900913@png/{z}/{x}/{y}.png', {tms: true,zIndex: 32, opacity: 0.9});
oil_palm_p.on("load",function() {$(".card-image_oil_palm_p").busyLoad("hide", {animation: "fade"});});

$('.add_oil_palm_p').click(function(event) {
  if (map.hasLayer(oil_palm_p)) {
    map.removeLayer(oil_palm_p);
    $( ".oil_palm_p_main" ).find( "#show_pa" ).hide();
    $(".card-image_oil_palm_p").busyLoad("hide", {animation: "fade"});
    $(this).css("color", "#ffffff");
   
}else{
  oil_palm_p.addTo(map);
  $(".card-image_oil_palm_p").busyLoad("show", busy_tabs);
  $( ".oil_palm_p_main" ).find( "#show_pa" ).show();
  $(this).css("color", "#b2610e");
}
});

// 	oilpalm

var oil_palm_vp = L.tileLayer('https://geospatial.jrc.ec.europa.eu/geoserver/gwc/service/tms/1.0.0/oilpalm:oilpalm_val_points@EPSG:900913@png/{z}/{x}/{y}.png', {tms: true,zIndex: 32, opacity: 0.9});
oil_palm_vp.on("load",function() {$(".card-image_oil_palm_vp").busyLoad("hide", {animation: "fade"});});

$('.add_oil_palm_vp').click(function(event) {
  if (map.hasLayer(oil_palm_vp)) {
    map.removeLayer(oil_palm_vp);
    $( ".oil_palm_vp_main" ).find( "#show_pa" ).hide();
    $(".card-image_oil_palm_vp").busyLoad("hide", {animation: "fade"});
    $(this).css("color", "#ffffff");
   
}else{
  oil_palm_vp.addTo(map);
  $(".card-image_oil_palm_vp").busyLoad("show", busy_tabs);
  $( ".oil_palm_vp_main" ).find( "#show_pa" ).show();
  $(this).css("color", "#b2610e");
}
});

// WDPA WMS GEOSERVER LAYER - SETUP
var url = 'https://geospatial.jrc.ec.europa.eu/geoserver/dopa_explorer_3/wms';
var wdpa=L.tileLayer.wms(url, {layers: 'dopa_explorer_3:dopa_geoserver_wdpa_master_201905',transparent: true,format: 'image/png',
featureInfoFormat: 'text/javascript',opacity:'0.2', makeLayerQueryable: true,zIndex: 33});
wdpa.on("load",function() {$(".nav-wrapper").busyLoad("hide", {animation: "fade"});});
// WDPA filter
wdpa.setParams({CQL_FILTER:"marine <> 2"});

var wdpa_marine=L.tileLayer.wms(url, {layers: 'dopa_explorer_3:dopa_geoserver_wdpa_master_201905',transparent: true,format: 'image/png',
featureInfoFormat: 'text/javascript',opacity:'0.4', makeLayerQueryable: true,zIndex: 33});
wdpa_marine.on("load",function() {$(".nav-wrapper").busyLoad("hide", {animation: "fade"});});
// WDPA filter
wdpa_marine.setParams({CQL_FILTER:"marine = 2"});
$( ".card-content" ).find( "#show_pa" ).click(function(event) {
  if (map.hasLayer(wdpa)) {
    map.removeLayer(wdpa);

}else{
  wdpa.addTo(map);
  $(".nav-wrapper").busyLoad("show", busy_wdpa);
}
});

$( ".card-content" ).find( "#show_pa_marine" ).click(function(event) {
  if (map.hasLayer(wdpa_marine)) {
    map.removeLayer(wdpa_marine);

}else{
  wdpa_marine.addTo(map);
  $(".nav-wrapper").busyLoad("show", busy_wdpa);
}
});


//Available Layers
var baseMaps = {"White" : light, "WorldImagery":WorldImagery};



