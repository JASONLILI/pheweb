(function() {
    // It's unfortunate that these are hard-coded, but it works pretty great, so I won't change it now.
    var defaults = [
        {
            "display":"ESA_COLESTEROLO (ESA_COLESTEROLO)",
            "url":"/pheno/ESA_COLESTEROLO",
            "value":"ESA_COLESTEROLO"
        },{
            "display":"ESA_TRIGLICERIDI (ESA_TRIGLICERIDI)",
            "url":"/pheno/ESA_TRIGLICERIDI",
            "value":"ESA_TRIGLICERIDI"
        },
        {
            "display":"HDL (HDL)",
            "url":"/pheno/HDL",
            "value":"HDL"
        },
        {
            "display":"LDL (LDL)",
            "url":"/pheno/LDL",
            "value":"LDL"
        }
    ];

    autocomplete_bloodhound = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('display'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        identify: function(sugg) { return sugg.display; }, // maybe allows Bloodhound to `.get()`  objects
        remote: {
            url: '/api/autocomplete?query=%QUERY',
            wildcard: '%QUERY',
            rateLimitBy: 'throttle',
            rateLimitWait: 500,
            transform: function(data) {
                // Probably this function reveals that I don't understand Bloodhound.
                // But, I want my previous results to stay around while I keep typing.
                // If the string that's currently in the searchbox matches some string that's been suggested before, I want to see it!
                // This especially happens while I'm typing a chrom-pos-ref-alt.  If what I'm typing agrees with something being suggested, it shouldn't disappear!
                // So, I'm just adding everything to the local index. (Note: NOT localstorage.)
                // Bloodhound appears to perform deduping.
                autocomplete_bloodhound.add(data);
                return data;
            },
        },
        local: defaults,
        sorter: function(a, b) { return (a.display > b.display) ? 1 : -1; },
    });

    function autocomplete_bloodhound_with_defaults(query, sync, async) {
        if (query.trim() === '') {
            sync(defaults);
        } else {
            autocomplete_bloodhound.search(query, sync, async);
        }
    }

    $(function() {
        $('.typeahead').typeahead({
            hint: false,
            highlight: true,
            minLength: 0,
        }, {
            name: 'autocomplete',
            source: autocomplete_bloodhound_with_defaults,
            display: 'value',
            limit: 100,
            templates: {
                suggestion: _.template("<div><%= display %></div>"),
                empty: "<div class='tt-empty-message'>No matches found.</div>"
            }
        });

        $('.typeahead').bind('typeahead:select', function(ev, suggestion) {
            window.location.href = suggestion.url;
        });
    });
})();


// convenience functions
function fmt(format) {
    var args = Array.prototype.slice.call(arguments, 1);
    return format.replace(/{(\d+)}/g, function(match, number) {
        return (typeof args[number] != 'undefined') ? args[number] : match;
    });
}
