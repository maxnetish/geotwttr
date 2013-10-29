/**
 * Created by max on 30.10.13.
 */

var vmIndex = function () {
    var self = this;

    this.testTitle = "i'm vmIndex";
    this.gmapCenter=ko.observable(new google.maps.LatLng(-34.397, 150.644));
    this.gmapZoom=ko.observable(6);
    this.gmapBound=ko.observable(new google.maps.LatLngBounds());

    this.gmapBound.subscribe(function(){
       console.log("gmap bounds mutated, gmapBounds="+self.gmapBound());
    });
};