---
layout: plugin

id: polybox
title: OctoPrint-PolyBox  
description: Plugin for OpenSource PolyBox that report Temp, Humidity, and scale values over USB.  
author: Mark Hendriksen  
license: AGPLv3  
date: 2022-02-27

homepage: https://github.com/hendriksen-mark/OctoPrint-PolyBox  
source: https://github.com/hendriksen-mark/OctoPrint-PolyBox
archive: https://github.com/hendriksen-mark/OctoPrint-PolyBox/archive/master.zip

tags:
- filament
- usb
- polybox

screenshots:
- url: ![Main](main.png)
  alt: Main screen  
  caption: Main View  
- url: ![Settings](settings.png)
  alt: Settings screen  
  caption: Settings View  
- url: ![Tab](tab_connected.png)
  alt: Tab when connected  
  caption: Tab when connected  
- url: ![Tab](tab_disconnected.png)
  alt: Tab when disconnected  
  caption: Tab when disconnected


featuredimage: ![Main](main.png)

---

Connects to any PolyBox supporting the below serial communications:
1) sends periodic updates in the following format:
    H:xx.xx% T:xx.xxC S1:x.xxkg S2:x.xxkg
1) accepts the following commands:
    1) SET H=xx (sets maxHumidity to xx)
    1) SET T=xx (sets maxTemperature to xx)
    1) TARE y (Tares scale y, 0<y<5)
