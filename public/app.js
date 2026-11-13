/* global google */
(function () {
  "use strict";

  var SELLER_CONFIG = {
    estateName: "Cedar Ridge",
    whatsappNumber: "15125550194",
    displayPhone: "+1 (512) 555-0194",
    center: { lat: 30.3075, lng: -97.9288 }
  };

  var PLOTS = [
    {
      id: "A-01",
      name: "Plot A-01 · Corner Meadow",
      category: "estate",
      status: "Available",
      sizeSqm: 1200,
      sizeLabel: "1,200 sqm",
      dimensions: "30m × 40m",
      frontage: "30m Paved Corner",
      price: 138000,
      priceFormatted: "$138,000",
      ratePerSqm: "$115 / sqm",
      description: "Elevated corner parcel with two-sided road frontage, mature oak shade along the western edge, and level clearing for a primary residence.",
      position: { lat: 30.3081, lng: -97.9296 }
    },
    {
      id: "A-02",
      name: "Plot A-02 · South Pasture",
      category: "residential",
      status: "Available",
      sizeSqm: 750,
      sizeLabel: "750 sqm",
      dimensions: "25m × 30m",
      frontage: "25m Paved Road",
      price: 89000,
      priceFormatted: "$89,000",
      ratePerSqm: "$119 / sqm",
      description: "Well-drained sunlit residential lot facing south with direct access to sealed road and underground power connection point.",
      position: { lat: 30.3077, lng: -97.9289 }
    },
    {
      id: "B-01",
      name: "Plot B-01 · Homestead Entry",
      category: "residential",
      status: "Available",
      sizeSqm: 550,
      sizeLabel: "550 sqm",
      dimensions: "20m × 27.5m",
      frontage: "20m Paved Road",
      price: 68000,
      priceFormatted: "$68,000",
      ratePerSqm: "$124 / sqm",
      description: "Compact build-ready home site near the estate entrance, ideal for a single-level home with low site preparation costs.",
      position: { lat: 30.3071, lng: -97.9292 }
    },
    {
      id: "C-01",
      name: "Plot C-01 · Upper Ridge Acreage",
      category: "estate",
      status: "Available",
      sizeSqm: 2400,
      sizeLabel: "2,400 sqm",
      dimensions: "40m × 60m",
      frontage: "40m Ridge Drive",
      price: 248000,
      priceFormatted: "$248,000",
      ratePerSqm: "$103 / sqm",
      description: "Largest panoramic crest parcel overlooking the wooded valley, offering privacy for a custom residence, guest house, and orchard.",
      position: { lat: 30.3083, lng: -97.9278 }
    },
    {
      id: "B-02",
      name: "Plot B-02 · Woodland Edge",
      category: "residential",
      status: "Reserved",
      sizeSqm: 820,
      sizeLabel: "820 sqm",
      dimensions: "24m × 34m",
      frontage: "24m Paved Road",
      price: 96000,
      priceFormatted: "$96,000",
      ratePerSqm: "$117 / sqm",
      description: "Shaded woodland-bordering residential parcel currently under buyer reservation.",
      position: { lat: 30.3069, lng: -97.9282 }
    }
  ];

  var GALLERY_PHOTOS = [
    {
      src: "/images/hero-aerial.jpg",
      title: "Aerial Estate Overview & Paved Access",
      meta: "Drone View · Golden Hour"
    },
    {
      src: "/images/plot-meadow.jpg",
      title: "Surveyed Corner Stake & Heritage Oak",
      meta: "Plot A-01 · Pegged Boundary"
    },
    {
      src: "/images/plot-road.jpg",
      title: "Sealed Asphalt Frontage & Fencing",
      meta: "Main Estate Corridor"
    },
    {
      src: "/images/plot-ridge.jpg",
      title: "Upper Ridge Valley Panorama",
      meta: "Plot C-01 · Elevated Crest"
    }
  ];

  var state = {
    filter: "all",
    selectedPlotId: "A-01",
    lightboxIndex: 0,
    lastBooking: null,
    map: null,
    infoWindow: null,
    markersById: {},
    nearbyLoaded: false
  };

  function buildWhatsAppUrl(message) {
    return "https://wa.me/" + SELLER_CONFIG.whatsappNumber + "?text=" + encodeURIComponent(message);
  }

  function showQuotaBanner() {
    var banner = document.getElementById("gmp-quota-banner");
    if (banner) {
      banner.hidden = false;
    }
  }

  window.addEventListener("gmp-quota-exceeded", showQuotaBanner);

  function getFilteredPlots() {
    return PLOTS.filter(function (plot) {
      if (state.filter === "available") return plot.status === "Available";
      if (state.filter === "residential") return plot.category === "residential";
      if (state.filter === "estate") return plot.category === "estate";
      return true;
    });
  }

  function selectPlotForInspection(plotId) {
    state.selectedPlotId = plotId;
    var selectEl = document.getElementById("plot-select");
    if (selectEl) {
      selectEl.value = plotId;
    }
    var inspectionEl = document.getElementById("inspection");
    if (inspectionEl) {
      inspectionEl.scrollIntoView({ behavior: "smooth" });
    }
  }

  function renderPlots() {
    var grid = document.getElementById("plots-grid");
    var tbody = document.getElementById("plots-table-body");
    if (!grid || !tbody) return;

    var visiblePlots = getFilteredPlots();
    grid.innerHTML = "";
    tbody.innerHTML = "";

    visiblePlots.forEach(function (plot) {
      var isAvailable = plot.status === "Available";
      var waMessage =
        "Hi, I'm interested in " +
        plot.name +
        " (" +
        plot.sizeLabel +
        ", " +
        plot.priceFormatted +
        ") at " +
        SELLER_CONFIG.estateName +
        ". Is it available for an inspection?";

      var card = document.createElement("article");
      card.className = "plot-card" + (isAvailable ? "" : " is-reserved");

      var top = document.createElement("div");

      var meta = document.createElement("div");
      meta.className = "plot-meta-line";
      meta.innerHTML =
        '<span class="mono-num">Plot ' +
        plot.id +
        '</span><span aria-hidden="true">·</span><span>' +
        (plot.category === "estate" ? "Corner &amp; Acreage" : "Standard Lot") +
        '</span><span aria-hidden="true">·</span><span class="' +
        (isAvailable ? "status-available" : "status-reserved") +
        '">' +
        plot.status +
        "</span>";

      var head = document.createElement("div");
      head.className = "plot-head-row";
      head.innerHTML =
        '<h3 class="plot-name">' +
        plot.name.replace("Plot " + plot.id + " · ", "") +
        '</h3><span class="plot-price">' +
        plot.priceFormatted +
        "</span>";

      var desc = document.createElement("p");
      desc.className = "plot-desc";
      desc.textContent = plot.description;

      var metrics = document.createElement("div");
      metrics.className = "plot-metrics";
      metrics.innerHTML =
        '<div><span class="plot-metric-label">Plot Size</span><span class="plot-metric-val">' +
        plot.sizeLabel +
        "</span></div>" +
        '<div><span class="plot-metric-label">Dimensions</span><span class="plot-metric-val">' +
        plot.dimensions +
        "</span></div>" +
        '<div><span class="plot-metric-label">Rate</span><span class="plot-metric-val">' +
        plot.ratePerSqm +
        "</span></div>";

      top.appendChild(meta);
      top.appendChild(head);
      top.appendChild(desc);
      top.appendChild(metrics);

      var actions = document.createElement("div");
      actions.className = "plot-actions";

      var bookBtn = document.createElement("button");
      bookBtn.type = "button";
      bookBtn.className = "btn btn-primary";
      bookBtn.textContent = isAvailable ? "Book Inspection" : "Join Waitlist";
      bookBtn.addEventListener("click", function () {
        selectPlotForInspection(plot.id);
      });

      var waLink = document.createElement("a");
      waLink.href = buildWhatsAppUrl(waMessage);
      waLink.target = "_blank";
      waLink.rel = "noopener noreferrer";
      waLink.className = "btn btn-whatsapp";
      waLink.textContent = "WhatsApp Seller";

      actions.appendChild(bookBtn);
      actions.appendChild(waLink);

      card.appendChild(top);
      card.appendChild(actions);
      grid.appendChild(card);

      var tr = document.createElement("tr");
      tr.innerHTML =
        '<td class="mono-num">' +
        plot.id +
        "</td>" +
        "<td>" +
        (plot.category === "estate" ? "Corner &amp; Acreage" : "Standard Lot") +
        "</td>" +
        '<td class="mono-num">' +
        plot.sizeLabel +
        "</td>" +
        '<td class="mono-num">' +
        plot.dimensions +
        "</td>" +
        "<td>" +
        plot.frontage +
        "</td>" +
        '<td class="mono-num">' +
        plot.priceFormatted +
        "</td>" +
        '<td class="mono-num">' +
        plot.ratePerSqm +
        "</td>" +
        '<td class="' +
        (isAvailable ? "status-available" : "status-reserved") +
        '">' +
        plot.status +
        "</td>";

      var tdAction = document.createElement("td");
      var rowBtn = document.createElement("button");
      rowBtn.type = "button";
      rowBtn.className = "table-action-link";
      rowBtn.textContent = isAvailable ? "Inspect" : "Reserved";
      rowBtn.disabled = !isAvailable;
      rowBtn.addEventListener("click", function () {
        selectPlotForInspection(plot.id);
      });
      tdAction.appendChild(rowBtn);
      tr.appendChild(tdAction);
      tbody.appendChild(tr);
    });
  }

  function setupFilters() {
    var filterButtons = document.querySelectorAll(".filter-btn");
    filterButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterButtons.forEach(function (b) {
          b.classList.remove("is-active");
          b.setAttribute("aria-selected", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-selected", "true");
        state.filter = btn.getAttribute("data-filter") || "all";
        renderPlots();
      });
    });
  }

  function renderGallery() {
    var grid = document.getElementById("gallery-grid");
    if (!grid) return;

    GALLERY_PHOTOS.forEach(function (photo, index) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "gallery-card";
      btn.setAttribute("aria-label", "View photo: " + photo.title);

      var thumb = document.createElement("div");
      thumb.className = "gallery-thumb";

      var img = document.createElement("img");
      img.src = photo.src;
      img.alt = photo.title;
      img.referrerPolicy = "no-referrer";
      thumb.appendChild(img);

      var cap = document.createElement("div");
      cap.className = "gallery-caption-row";
      cap.innerHTML =
        '<span class="gallery-title">' +
        photo.title +
        '</span><span class="gallery-meta">' +
        photo.meta +
        "</span>";

      btn.appendChild(thumb);
      btn.appendChild(cap);
      btn.addEventListener("click", function () {
        openLightbox(index);
      });
      grid.appendChild(btn);
    });
  }

  function openLightbox(index) {
    state.lightboxIndex = index;
    var lightbox = document.getElementById("lightbox");
    updateLightboxContent();
    if (lightbox) {
      lightbox.hidden = false;
      document.body.style.overflow = "hidden";
    }
  }

  function closeLightbox() {
    var lightbox = document.getElementById("lightbox");
    if (lightbox) {
      lightbox.hidden = true;
      document.body.style.overflow = "";
    }
  }

  function updateLightboxContent() {
    var photo = GALLERY_PHOTOS[state.lightboxIndex];
    var img = document.getElementById("lightbox-img");
    var caption = document.getElementById("lightbox-caption");
    if (img && photo) {
      img.src = photo.src;
      img.alt = photo.title;
    }
    if (caption && photo) {
      caption.textContent = photo.title + " · " + photo.meta;
    }
  }

  function setupLightbox() {
    var closeEls = document.querySelectorAll("[data-lightbox-close]");
    closeEls.forEach(function (el) {
      el.addEventListener("click", closeLightbox);
    });

    var prevBtn = document.getElementById("lightbox-prev");
    var nextBtn = document.getElementById("lightbox-next");
    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        state.lightboxIndex = (state.lightboxIndex - 1 + GALLERY_PHOTOS.length) % GALLERY_PHOTOS.length;
        updateLightboxContent();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        state.lightboxIndex = (state.lightboxIndex + 1) % GALLERY_PHOTOS.length;
        updateLightboxContent();
      });
    }

    document.addEventListener("keydown", function (e) {
      var lightbox = document.getElementById("lightbox");
      if (!lightbox || lightbox.hidden) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") {
        state.lightboxIndex = (state.lightboxIndex - 1 + GALLERY_PHOTOS.length) % GALLERY_PHOTOS.length;
        updateLightboxContent();
      }
      if (e.key === "ArrowRight") {
        state.lightboxIndex = (state.lightboxIndex + 1) % GALLERY_PHOTOS.length;
        updateLightboxContent();
      }
    });
  }

  function renderMapSidebarList() {
    var list = document.getElementById("map-plot-list");
    if (!list) return;
    list.innerHTML = "";

    PLOTS.forEach(function (plot) {
      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "map-plot-btn" + (state.selectedPlotId === plot.id ? " is-selected" : "");
      btn.setAttribute("data-plot-pin", plot.id);
      btn.innerHTML =
        '<div><div class="map-plot-title">' +
        plot.id +
        " · " +
        plot.sizeLabel +
        '</div><div class="map-plot-sub">' +
        plot.status +
        "</div></div>" +
        '<span class="mono-num">' +
        plot.priceFormatted +
        "</span>";

      btn.addEventListener("click", function () {
        focusMapPlot(plot.id);
      });
      li.appendChild(btn);
      list.appendChild(li);
    });
  }

  function createInfoWindowNode(plot) {
    var wrap = document.createElement("div");
    wrap.className = "iw-card";

    var title = document.createElement("h4");
    title.className = "iw-title";
    title.textContent = plot.name;

    var meta = document.createElement("p");
    meta.className = "iw-meta";
    meta.textContent = plot.sizeLabel + " · " + plot.dimensions + " · " + plot.priceFormatted + " (" + plot.status + ")";

    var actions = document.createElement("div");
    actions.className = "iw-actions";

    var bookBtn = document.createElement("button");
    bookBtn.type = "button";
    bookBtn.className = "iw-btn";
    bookBtn.textContent = "Book Inspection";
    bookBtn.addEventListener("click", function () {
      selectPlotForInspection(plot.id);
    });

    var waLink = document.createElement("a");
    waLink.href = buildWhatsAppUrl(
      "Hi, I'm viewing " + plot.name + " (" + plot.priceFormatted + ") on the map and would like details."
    );
    waLink.target = "_blank";
    waLink.rel = "noopener noreferrer";
    waLink.className = "iw-btn iw-btn-wa";
    waLink.textContent = "WhatsApp";

    actions.appendChild(bookBtn);
    actions.appendChild(waLink);

    wrap.appendChild(title);
    wrap.appendChild(meta);
    wrap.appendChild(actions);
    return wrap;
  }

  function focusMapPlot(plotId) {
    state.selectedPlotId = plotId;
    var buttons = document.querySelectorAll("[data-plot-pin]");
    buttons.forEach(function (b) {
      b.classList.toggle("is-selected", b.getAttribute("data-plot-pin") === plotId);
    });

    var plot = PLOTS.find(function (p) {
      return p.id === plotId;
    });
    if (!plot) return;

    if (state.map) {
      state.map.panTo(plot.position);
      state.map.setZoom(18);
    }

    var marker = state.markersById[plotId];
    if (state.map && state.infoWindow && marker) {
      state.infoWindow.setContent(createInfoWindowNode(plot));
      state.infoWindow.open({
        map: state.map,
        anchor: marker,
        shouldFocus: false
      });
    }
  }

  function loadGoogleMapsBootstrap(apiKey) {
    return new Promise(function (resolve, reject) {
      if (window.google && window.google.maps && window.google.maps.importLibrary) {
        resolve();
        return;
      }

      if (!apiKey) {
        reject(new Error("Google Maps API key is not configured."));
        return;
      }

      /* Dynamic Library Import bootstrap */
      (function (g) {
        var h;
        var a;
        var k;
        var p = "The Google Maps JavaScript API";
        var c = "google";
        var l = "importLibrary";
        var q = "__ib__";
        var m = document;
        var b = window;
        b = b[c] || (b[c] = {});
        var d = b.maps || (b.maps = {});
        var r = new Set();
        var e = new URLSearchParams();
        var u = function () {
          return (
            h ||
            (h = new Promise(function (f, n) {
              a = m.createElement("script");
              e.set("libraries", Array.from(r).join(","));
              for (k in g) {
                e.set(
                  k.replace(/[A-Z]/g, function (t) {
                    return "_" + t[0].toLowerCase();
                  }),
                  g[k]
                );
              }
              e.set("callback", c + ".maps." + q);
              a.src = "https://maps." + c + "apis.com/maps/api/js?" + e;
              d[q] = f;
              a.onerror = function () {
                h = n(new Error(p + " could not load."));
              };
              a.nonce = (m.querySelector("script[nonce]") && m.querySelector("script[nonce]").nonce) || "";
              m.head.append(a);
            }))
          );
        };
        if (d[l]) {
          resolve();
        } else {
          d[l] = function (f) {
            var args = Array.prototype.slice.call(arguments);
            r.add(f);
            return u().then(function () {
              return d[l].apply(null, args);
            });
          };
          resolve();
        }
      })({
        key: apiKey,
        v: "weekly",
        language: "en",
        region: "US"
      });
    });
  }

  function showMapFallback(reason) {
    var fallback = document.getElementById("map-fallback");
    var reasonEl = document.getElementById("map-fallback-reason");
    if (reasonEl && reason) {
      reasonEl.textContent = reason;
    }
    if (fallback) {
      fallback.hidden = false;
    }
  }

  async function initMap() {
    renderMapSidebarList();

    var apiKey = window.__GOOGLE_MAPS_API_KEY__ || "";
    try {
      await loadGoogleMapsBootstrap(apiKey);
      var mapsLib = await google.maps.importLibrary("maps");
      var markerLib = await google.maps.importLibrary("marker");

      var mapContainer = document.getElementById("map");
      if (!mapContainer) return;

      var map = new mapsLib.Map(mapContainer, {
        center: SELLER_CONFIG.center,
        zoom: 17,
        mapTypeId: "hybrid",
        mapId: "DEMO_MAP_ID",
        gestureHandling: "cooperative",
        mapTypeControl: false,
        streetViewControl: true,
        fullscreenControl: true,
        internalUsageAttributionIds: ["gmp_mcp_codeassist_v1_aistudio"]
      });

      state.map = map;
      state.infoWindow = new mapsLib.InfoWindow({ maxWidth: 280 });

      PLOTS.forEach(function (plot) {
        var isAvailable = plot.status === "Available";
        var pin = new markerLib.PinElement({
          glyphText: plot.id,
          background: isAvailable ? "#1b4332" : "#66736d",
          borderColor: "#ffffff",
          glyphColor: "#ffffff",
          scale: 1.05
        });

        var marker = new markerLib.AdvancedMarkerElement({
          map: map,
          position: plot.position,
          title: plot.name
        });
        marker.append(pin);

        marker.addListener("click", function () {
          focusMapPlot(plot.id);
        });

        state.markersById[plot.id] = marker;
      });

      focusMapPlot("A-01");
    } catch (err) {
      var msg = err && err.message ? err.message : "";
      if (msg.indexOf("Quota") !== -1 || msg.indexOf("RESOURCE_EXHAUSTED") !== -1) {
        showQuotaBanner();
      }
      showMapFallback(
        "Google Maps could not be initialized right now. You can still view every plot coordinate and open directions directly in Google Maps."
      );
    }
  }

  function setupMapControls() {
    var mapTypeButtons = document.querySelectorAll("[data-map-type]");
    mapTypeButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        mapTypeButtons.forEach(function (b) {
          b.classList.remove("is-active");
        });
        btn.classList.add("is-active");
        var type = btn.getAttribute("data-map-type");
        if (state.map && type) {
          state.map.setMapTypeId(type);
        }
      });
    });

    var nearbyBtn = document.getElementById("load-nearby-btn");
    if (nearbyBtn) {
      nearbyBtn.addEventListener("click", async function () {
        var panel = document.getElementById("nearby-panel");
        var status = document.getElementById("nearby-status");
        var list = document.getElementById("nearby-list");
        if (!panel || !status || !list) return;

        panel.hidden = false;
        if (state.nearbyLoaded) return;

        status.textContent = "Searching nearby essentials via Google Places...";
        list.innerHTML = "";

        try {
          if (!window.google || !window.google.maps || !window.google.maps.importLibrary) {
            throw new Error("Maps SDK not ready");
          }
          var placesLib = await google.maps.importLibrary("places");
          var request = {
            fields: ["displayName", "primaryTypeDisplayName", "formattedAddress"],
            locationRestriction: {
              center: SELLER_CONFIG.center,
              radius: 5000
            },
            includedPrimaryTypes: ["school", "supermarket", "park", "hospital"],
            maxResultCount: 5
          };

          var response = await placesLib.Place.searchNearby(request);
          var places = (response && response.places) || [];

          if (places.length === 0) {
            status.textContent = "No nearby essentials returned within 5 km.";
            state.nearbyLoaded = true;
            return;
          }

          status.textContent = "Places found within 5 km of site:";
          places.forEach(function (place) {
            var li = document.createElement("li");
            li.className = "nearby-item";
            var name = document.createElement("strong");
            name.textContent = place.displayName || "Nearby Place";
            var detail = document.createElement("span");
            detail.textContent =
              (place.primaryTypeDisplayName ? place.primaryTypeDisplayName + " · " : "") +
              (place.formattedAddress || "");
            li.appendChild(name);
            li.appendChild(detail);
            list.appendChild(li);
          });
          state.nearbyLoaded = true;
        } catch (err) {
          var errText = err && err.message ? err.message : "";
          if (
            errText.indexOf("429") !== -1 ||
            errText.indexOf("RESOURCE_EXHAUSTED") !== -1 ||
            errText.indexOf("OVER_QUERY_LIMIT") !== -1
          ) {
            showQuotaBanner();
          }
          status.textContent = "Nearby places search unavailable right now. Open Google Maps for full area details.";
        }
      });
    }
  }

  function setupBookingForm() {
    var selectEl = document.getElementById("plot-select");
    var dateEl = document.getElementById("visit-date");
    var formEl = document.getElementById("inspection-form");
    var confirmEl = document.getElementById("booking-confirmation");
    var errorEl = document.getElementById("form-error");

    if (selectEl) {
      PLOTS.forEach(function (plot) {
        var opt = document.createElement("option");
        opt.value = plot.id;
        opt.textContent = plot.name + " (" + plot.sizeLabel + " · " + plot.priceFormatted + " · " + plot.status + ")";
        selectEl.appendChild(opt);
      });
      selectEl.value = state.selectedPlotId;
    }

    if (dateEl) {
      var tomorrow = new Date(Date.now() + 86400000);
      var iso = tomorrow.toISOString().split("T")[0];
      dateEl.min = new Date().toISOString().split("T")[0];
      dateEl.value = iso;
    }

    if (formEl) {
      formEl.addEventListener("submit", function (e) {
        e.preventDefault();
        if (errorEl) {
          errorEl.hidden = true;
          errorEl.textContent = "";
        }

        var plotId = document.getElementById("plot-select").value;
        var visitDate = document.getElementById("visit-date").value;
        var visitTime = document.getElementById("visit-time").value;
        var buyerName = document.getElementById("buyer-name").value.trim();
        var buyerPhone = document.getElementById("buyer-phone").value.trim();
        var buyerEmail = document.getElementById("buyer-email").value.trim();
        var buyerNotes = document.getElementById("buyer-notes").value.trim();

        var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerEmail);
        var phoneDigits = buyerPhone.replace(/\D/g, "");

        if (!buyerName || phoneDigits.length < 7 || !emailOk || !visitDate) {
          if (errorEl) {
            errorEl.textContent = "Please enter your full name, a valid phone number, a valid email address, and a viewing date.";
            errorEl.hidden = false;
          }
          return;
        }

        var chosenPlot =
          PLOTS.find(function (p) {
            return p.id === plotId;
          }) || PLOTS[0];

        state.lastBooking = {
          plot: chosenPlot,
          visitDate: visitDate,
          visitTime: visitTime,
          buyerName: buyerName,
          buyerPhone: buyerPhone,
          buyerEmail: buyerEmail,
          buyerNotes: buyerNotes
        };

        var summaryEl = document.getElementById("confirm-summary");
        if (summaryEl) {
          summaryEl.textContent =
            buyerName +
            ", your inspection for " +
            chosenPlot.name +
            " (" +
            chosenPlot.sizeLabel +
            ") is scheduled for " +
            visitDate +
            " at " +
            visitTime +
            ". Send the summary via WhatsApp below for immediate gate access confirmation.";
        }

        var waBtn = document.getElementById("confirm-whatsapp-send");
        if (waBtn) {
          var waText =
            "Hello, I just booked a site inspection for " +
            chosenPlot.name +
            " (" +
            chosenPlot.priceFormatted +
            ") on " +
            visitDate +
            " at " +
            visitTime +
            ". Name: " +
            buyerName +
            " (" +
            buyerPhone +
            ")." +
            (buyerNotes ? " Notes: " + buyerNotes : "");
          waBtn.href = buildWhatsAppUrl(waText);
        }

        formEl.hidden = true;
        if (confirmEl) confirmEl.hidden = false;
      });
    }

    var resetBtn = document.getElementById("reset-booking-btn");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        if (confirmEl) confirmEl.hidden = true;
        if (formEl) formEl.hidden = false;
      });
    }

    var icsBtn = document.getElementById("download-ics-btn");
    if (icsBtn) {
      icsBtn.addEventListener("click", function () {
        if (!state.lastBooking) return;
        var b = state.lastBooking;
        var dateCompact = b.visitDate.replace(/-/g, "");
        var hour = b.visitTime.indexOf("09:") !== -1 ? "090000" : b.visitTime.indexOf("12:") !== -1 ? "123000" : "160000";
        var endHour = b.visitTime.indexOf("09:") !== -1 ? "100000" : b.visitTime.indexOf("12:") !== -1 ? "133000" : "170000";
        var ics = [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "PRODID:-//Cedar Ridge//Site Inspection//EN",
          "BEGIN:VEVENT",
          "UID:inspection-" + Date.now() + "@cedarridge.local",
          "DTSTAMP:" + dateCompact + "T" + hour,
          "DTSTART:" + dateCompact + "T" + hour,
          "DTEND:" + dateCompact + "T" + endHour,
          "SUMMARY:Land Inspection - " + b.plot.name,
          "DESCRIPTION:Site walkthrough at Cedar Ridge (" + b.plot.sizeLabel + " - " + b.plot.priceFormatted + "). Seller contact: " + SELLER_CONFIG.displayPhone,
          "LOCATION:30.3075, -97.9288",
          "END:VEVENT",
          "END:VCALENDAR"
        ].join("\r\n");

        var blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
        var url = URL.createObjectURL(blob);
        var link = document.createElement("a");
        link.href = url;
        link.download = "cedar-ridge-inspection-" + b.plot.id.toLowerCase() + ".ics";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      });
    }

    var copyBtn = document.getElementById("copy-phone-btn");
    var copyFeedback = document.getElementById("copy-feedback");
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(SELLER_CONFIG.displayPhone).then(
            function () {
              if (copyFeedback) copyFeedback.textContent = "Phone number copied to clipboard.";
            },
            function () {
              if (copyFeedback) copyFeedback.textContent = "Seller phone: " + SELLER_CONFIG.displayPhone;
            }
          );
        } else if (copyFeedback) {
          copyFeedback.textContent = "Seller phone: " + SELLER_CONFIG.displayPhone;
        }
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderPlots();
    setupFilters();
    renderGallery();
    setupLightbox();
    setupMapControls();
    setupBookingForm();
    initMap();
  });
})();
