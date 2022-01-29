---
title: 南河城
description: 南河城是位于火星伊希地的一座重要城市
image:
tags:
  - 2123
  - 服务业
---

{{< rawhtml >}}
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.6.0/dist/leaflet.css" integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ==" crossorigin=""/>
<script src="https://unpkg.com/leaflet@1.6.0/dist/leaflet.js" integrity="sha512-gZwIG9x3wUXg2hdXF6+rVkLF/0Vi9U8D2Ntg4Ga5I5BZpVkVxlJWbSQtXPSiUTtC0TjtGOmxa1AJPuV0CPthew==" crossorigin=""></script>

<link rel="stylesheet" href="/assets/map/fontawesome-markers/leaflet.awesome-markers.css"/>
<script src="/assets/map/fontawesome-markers/leaflet.awesome-markers.min.js"></script>

<style>
    #map {
        width: 100%;
        height: 500px;
    }
</style>


<div id='map'></div>

<script>

    var map = L.map('map', {
        crs: L.CRS.Simple
    });

    var bounds = [[0,0], [761, 943]];
    var image = L.imageOverlay('https://raw.githubusercontent.com/InterImm/martian-cities/master/city-plan/isidis-procyon/isidis-city-procyon.jpg', bounds).addTo(map);

    data = [
       {
          "name": "InterImm Building",
          "description": "Interplanetary Immigration Center",
          "link": "https://interimm.org",
          "geolocation": [ 381, 439 ],
       },
       {
        "name": "星移农业技术有限公司 - InterImm Agriculture",
        "description": "星移农业最初是星际移民中心下属的一个非盈利科研机构，由美国NASA和中国航空三院联合建立，依托于中国科学院成都生物所。随后该机构相继将多项关键技术工程化，并成功在火星一期基地建设期间建成火星农业实验室和火星第一农业基地。该机构随后成立公司，并在成都和火星设立双总部。",
        "link": "https://interimm.org/hub/companies/company-1518927000293/",
        "geolocation": [718,456],
     },
       {
        "name": "黄昏星-The evening star",
        "description": "时属杨家的私人家族企业，其创始人为距今100年前的海斯帕小姐。该企曾成功打击多个太空走私集团头目并向世人揭露出太空走私者联盟内部交易的黑幕，同时致力于太空大盗的追捕行动。与打击太空犯罪局为长期友好合作关系。",
        "link": "https://interimm.org/hub/companies/company-vgwsng7isbcuh2kzbrao1vgwsng74w79/",
        "geolocation": [431,21],
     },
     {
        "name": "俊哲宇宙文化传媒公司-火星工作室",
        "description": "本工作室直属于俊哲宇宙文化传媒公司地球总部，是探索外太空文化娱乐传媒范式的先锋组织，也是进行星际文化交流的排头兵。",
        "link": "http://interimm.org/hub/companies/company-ypfbogrqi22962fbooypfbe0yhohcabn/",
        "geolocation": [423.5, 334],
     }
    ]

     console.log(data)

     function add_one_institute(one_company, the_color) {
        console.log(one_company)

        if (one_company.link === undefined) {
           var one_company__link = ""
        }
        else {
           var one_company__link = one_company.link
        }
        one_company__link_clean = one_company__link.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, "");

        var one_company_marker = L.marker(
            one_company.geolocation, {
                icon: L.AwesomeMarkers.icon({icon: 'star', markerColor: 'red', prefix: 'fa', spin:false}) ,
                opacity: 0.9,
                color: the_color,
                title: one_company.name,
                alt: one_company.name,
                riseOnHover: true
        })
        one_company_marker.bindPopup(
              "<h3>" + one_company.name + "</h3>"
              + one_company.description
              + "<br>Link: <a href='" +
              one_company.link + "' target='blank'>" +
              one_company__link_clean + "</a>"
           ).openPopup();
        one_company_marker.addTo(map)
     }

     for (it of data) {
        console.log("for: " + it)
        add_one_institute(it, 'red')
     }

     map.closePopup()

    map.fitBounds(bounds);

map.on('click', function(e) {
    console.log("Lat, Lon : " + e.latlng.lat + ", " + e.latlng.lng)
});


</script>
{{< /rawhtml >}}


## 城市介绍

由于历史原因，南河城的主要功能是服务业。位于城市中心的是星际移民中心的巨型建筑。关于南河城的起源可以参考[伊希地城市圈](http://book.interimm.org/history/mars_immigration/#%E4%BC%8A%E5%B8%8C%E5%9C%B0%E5%9F%8E%E5%B8%82%E5%9C%88)。

目前建设情况可以参考下面的3D模型。可以在我们的 GitHub 创建新的 [Issues](https://github.com/InterImm/martian-cities/issues/2) 来提出你的建筑或者地标设想，并且命名。

{{< rawhtml >}}
<div class="sketchfab-embed-wrapper"><iframe width="100%" height="600" src="https://sketchfab.com/models/38483b36866847baba1dd115066dd5eb/embed" frameborder="0" allowvr="" allowfullscreen="allowfullscreen" mozallowfullscreen="true" webkitallowfullscreen="true" onmousewheel=""></iframe></div>
{{< /rawhtml >}}
