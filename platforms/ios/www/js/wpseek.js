window._apiUrl = 'http://api.wpseek.com/1.1/';
var wpsQuickAdded = [];

var wpseek = new Framework7({
	onBeforePageInit: function (page) {},
	onPageInit: function (page) {},
	modalTitle: 'WPSeek Mobile',
	router: true,
	animatePages: true,
	reloadPages: true,
	preloadPreviousPage: false,
	precompileTemplates: true,
	template7Pages: true,
	animateNavBackIcon: true,
	onAjaxStart: function (xhr) {
		wpseek.showIndicator();
    },
    onAjaxComplete: function (xhr) {
    	wpseek.hideIndicator();
    }
});
$$ = Dom7;

wpseek.onPageInit("page-home", function(page) {
	wpseek.run(false);
});

wpseek.onPageInit("page-browse-funcs", function(page) {
	var data = wpseek.template7Data['page:page-browse-funcs'][page.query.l].items;

	var funcList = wpseek.virtualList('.list-block.virtual-list', {
	    items: [],
	    template: '<li class="swipeout"><div class="swipeout-content"><a href="item-func.html?s={{title}}" class="item-link item-content">' +
	    		'<div class="item-media"><i class="icon icon-doc"></i></div>' +
	    		'<div class="item-inner"><div class="item-title">{{title}}</div></div>' +
	    	'</a></div><div class="swipeout-actions-left"><a href="#" data-name="{{title}}" data-type="function" class="bg-green function-add"><i class="icon icon-plus"></i></a></div><div class="swipeout-actions-right"><a href="#" data-name="{{title}}" data-type="function" class="bg-red function-remove"><i class="icon icon-minus"></i></a></div></li>',
	    searchAll: function (query, items) {
	    	var foundItems = [];
	    	for (var i = 0; i < items.length; i++) {
	    		if (items[i].title.indexOf(query.trim()) >= 0) foundItems.push(i);
	    	}
	    	return foundItems;
	    }
	});

	data.forEach(function (func, index) {
		if( func.name != '' ) {
			funcList.appendItem({
			    title: func.name
			});
		}
	});
	
	var funcLoading = false;
	var funcLastIndex = funcList.items.length;
	var funcItemsPerLoad = 25;
	var funcMaxItems = wpseek.template7Data['page:page-browse-funcs'][page.query.l].cnt;
	
	//console.log( funcLastIndex );
	//console.log( funcMaxItems );
	
	if( funcLastIndex >= funcMaxItems ) {
		wpseek.detachInfiniteScroll($$('.infinite-scroll-func'));
		$$('.infinite-scroll-func-preloader').remove();
	}
	
	$$('.infinite-scroll-func').on('infinite', function () {
		if( funcLoading ) return;
		funcLoading = true;
		
		var q = window._apiUrl + 'app/functions/' + page.query.l + '.json?offset=' + funcLastIndex + '&limit=' + funcItemsPerLoad;
		$$.get(q, function (results) {
			results = JSON.parse(results);
			if( results.status == 'ok' ) {
				funcLoading = false;
			 
				if( funcLastIndex >= funcMaxItems ) {
					wpseek.detachInfiniteScroll($$('.infinite-scroll-func'));
					$$('.infinite-scroll-func-preloader').remove();
					return;
				}
			 
				funcLastIndex = funcList.items.length;
				
				//console.log( funcLastIndex );
				//console.log( funcMaxItems );
				
				funcList.appendItems(results.functions);
		    }
		});
	});
});

wpseek.onPageAfterAnimation("page-browse-funcs", function(page) {
	if( window.localStorage.getItem('wps_tut_swipeout') == 'false' || window.localStorage.getItem('wps_tut_swipeout') == null ) {
		setTimeout(function() {
			var html = $$('.view-main li.swipeout:first-child .swipeout-actions-right').html();
			$$('.view-main li.swipeout:first-child .swipeout-actions-right').remove();
			wpseek.swipeoutOpen('.view-main li.swipeout:first-child');
			setTimeout(function() {
				wpseek.swipeoutClose('.view-main li.swipeout:first-child');
				$$('<div class="swipeout-actions-right">' + html + '</div>').insertAfter('.view-main li.swipeout:first-child .swipeout-actions-left');

				setTimeout(function() {
					wpseek.swipeoutOpen('.view-main li.swipeout:first-child');
					setTimeout(function() {
						wpseek.swipeoutClose('.view-main li.swipeout:first-child');
						window.localStorage.setItem('wps_tut_swipeout', 'true');
					}, 500);
				}, 500);
			}, 500);
		}, 500);
	}
});

$$(document).on('click', 'a.function-add', function(e) {
	var name = $$(this).data('name');
	var type = $$(this).data('type');
	if( name != '' && type != '' ) {
		var obj = {name: name, type: type};
		wpseek.quickAdd(obj);
	}
});
$$(document).on('click', 'a.function-remove', function(e) {
	var name = $$(this).data('name');
	if( name != '' ) {
		wpseek.quickRemove(name);
	}
});
$$(document).on('deleted', '.swipeout', function(e) {
	var name = $$(this).find('a.swipeout-delete').data('name');
	//console.log(name);
	if( name != '' ) {
		wpseek.quickRemove(name);
	}
});

wpseek.quickAdd = function(data) {
	var quickAccess = JSON.parse(window.localStorage.getItem('wps_quick_list')) || wpsQuickAdded;
	var exist = false;
	for( var i=0;i<quickAccess.length;i++ ) {
		if( quickAccess[i].name == data.name ) {
        	exist = true;
            break;
        }
	}
	if( !exist ) {
		quickAccess.push(data);
		wpseek.addNotification({
	    	title: 'WPSeek Mobile',
	        message: "'" + data.name + "'" + " has been added to your Quick Access list!",
	        media: '<i class="icon icon-wpseek2"></i>'
	    });
    } else {
		wpseek.addNotification({
	    	title: 'WPSeek Mobile',
	        message: "'" + data.name + "'" + " already exists in your Quick Access list!",
	        media: '<i class="icon icon-wpseek2"></i>'
	    });
    }

    window.localStorage.setItem('wps_quick_list', JSON.stringify(quickAccess));
}

wpseek.quickRemove = function(data) {
	var quickAccess = JSON.parse(localStorage["wps_quick_list"]) || wpsQuickAdded;
	for( i=0;i<quickAccess.length;i++ ) {
		if( quickAccess[i].name == data ) quickAccess.splice(i, 1);
	}

	window.localStorage["wps_quick_list"] = JSON.stringify(quickAccess);

    wpseek.addNotification({
    	title: 'WPSeek Mobile',
        message: "'" + data + "'" + " has been removed from your Quick Access list!",
        media: '<i class="icon icon-wpseek2"></i>'
    });
}

wpseek.onPageInit("page-func-details", function(page) {
	var q = window._apiUrl + 'app/function/info/' + page.query.s + '.json';
	$$.get(q, function (results) {
		var html = '';
		results = JSON.parse(results);
		if( results.status == 'ok' ) {
			//console.log( results );

			var sel_id = 'page-func-details-' + results.term;
			$$('div[data-page=page-func-details].page-from-right-to-center, div[data-page=page-func-details].page-on-center').addClass(sel_id);
			$$('div[data-page=page-func-details].page-on-left').removeClass(sel_id);
			$$('.' + sel_id + '.page .preloader_func').hide();
			$$('.' + sel_id + '.page #paramslisting').html(results.params_list);
			$$('.' + sel_id + '.page #funcinfo_table').html(results.funcinfo_table);
			$$('.' + sel_id + '.page #func-desc-short').html(results.description.short);
			$$('.' + sel_id + '.page #func-desc-full').html(results.description.full);
			$$('.' + sel_id + '.page #function-url').val(results.url);
			$$('.' + sel_id + '.page #list_rel').html(results.related);
			$$('.' + sel_id + '.page #version-since').html(results.version.introduced);
			$$('.' + sel_id + '.page #version-deprecated').html(results.version.deprecated);

			if( $$('.' + sel_id + '.page #desc-' + page.query.s).html().length > 0 ) {
				$$('#popup-func-desc-title').text(page.query.s);
				$$('#popup-func-desc-content').html( $$('.' + sel_id + '.page #desc-' + page.query.s).html() );
				//console.log('desc-' + page.query.s);
			}

			var funcTitle = results.term;
			var funcLink = results.url;
			var funcDesc = results.description.short + "\n\n" + results.description.full;

			var shareSheetButtons = [
     	        [{
     	            text: 'Share and read later.',
     	            label: true
     	        },{
     	            text: 'Share...',
     	            onClick: function() {
     	            	window.plugins.socialsharing.share("Check out this WordPress function on wpseek.com", null, null, funcLink);
     	            }
     	        }, {
     	            text: 'Share via Facebook...',
     	            onClick: function() {
     	            	window.plugins.socialsharing.shareViaFacebook("Check out this #WordPress function on wpseek.com", null, funcLink);
     	            }
     	        }, {
     	            text: 'Share via Twitter...',
     	            onClick: function() {
     	            	window.plugins.socialsharing.shareViaTwitter("Check out this #WordPress function on wpseek.com ( via @wpseek )", null, funcLink);
     	            }
     	        }, {
     	            text: 'Share via Email...',
     	            onClick: function() {
     	            	window.plugins.socialsharing.shareViaEmail(
     	            		funcDesc + "\n\n" + funcLink,
     	            		"WordPress function details for " + funcTitle,
     	            		null, // TO: must be null or an array
     	            		null, // CC: must be null or an array
     	            		null, // BCC: must be null or an array
     	            		null, // FILES: can be null, a string, or an array
     	            		null, // called when sharing worked, but also when the user cancelled sharing via email (I've found no way to detect the difference)
     	            		null // called when sh*t hits the fan
     	            	);
     	            }
     	        }, ],
     	        [{
     	            text: 'Cancel',
     	            color: 'red',
     	            bold: true
     	        }]
     	    ];
     	    $$('.' + sel_id + '.page .detailShare').on('click', function(e) {
     	    	wpseek.actions(this, shareSheetButtons);
     	    });
		} else {
			navigator.notification.alert('Unable to get content for ' + slug, null, 'Error', 'Close');
		}
	});
});

wpseek.onPageAfterAnimation("page-func-details", function(page) {
	if( page.from = 'left' ) {
		$$('#popup-func-desc-title').text(page.query.s);
		$$('#popup-func-desc-content').html( $$('.page.page-func-details-' + page.query.s + ' #desc-' + page.query.s).html() );
	}
});


var leftView = wpseek.addView('.view-left', {
	dynamicNavbar: true
});

var mainView = wpseek.addView('.view-main', {
	dynamicNavbar: true,
	animateNavBackIcon: true,
	showBarsOnPageScrollEnd: false
});


wpseek.run = function(firstrun) {
	if( firstrun ) {
		wpseek.showPreloader('Pressing...');
		$$.get(window._apiUrl + 'app/ios.json', function (results) {
			results = JSON.parse(results);
			if( results.status == 'ok' ) {
				//wpseek.template7Data.letters = results;
				window.sessionStorage.setItem('function_list', JSON.stringify(results.letters));
				window.sessionStorage.setItem('hot', JSON.stringify(results.hot));
				window.sessionStorage.setItem('recently', JSON.stringify(results.recently));

				wpseek.template7Data['page:page-browse-funcs-letters'] = JSON.parse(window.sessionStorage.getItem('function_list'));
				wpseek.template7Data['page:page-browse-funcs'] = JSON.parse(window.sessionStorage.getItem('function_list'));
				wpseek.template7Data['page:page-browse-funcs-hot'] = JSON.parse(window.sessionStorage.getItem('hot'));

				var recently = Template7.templates.recentlyResultsTemplate(results.recently.items);
				$$('.recently-results').html(recently);

				wpseek.buildQuickAccessList();

				$$('#wphotversion').text(results.hot.wpversion);

				$$('#recently_date_left').text('( ' + results.recently.date + ' )');
				$$('#recently_date_main').text('( ' + results.recently.date + ' )');

				$$('#funcstotal').text(results.letters.total);

				setTimeout(function() {
					wpseek.hidePreloader();
		    		navigator.splashscreen.hide();

	    			//window.localStorage.setItem('wps_intro', 'false');
		    		if( window.localStorage.getItem('wps_intro') == 'false' || window.localStorage.getItem('wps_intro') == null ) {
		    			mainView.router.loadPage('intro.html');
		    			window.localStorage.setItem('wps_intro', 'true');
					}
		    	}, 500);
			} else {
				navigator.notification.alert('Unable to get function data. Please try again later!', function() { navigator.app.exitApp(); }, 'Error', 'Close');
			}
		});
	} else {
		var recently = Template7.templates.recentlyResultsTemplate(JSON.parse(window.sessionStorage.getItem('recently')).items);
		$$('.recently-results').html(recently);

		wpseek.buildQuickAccessList();

		$$('#wphotversion').text(JSON.parse(window.sessionStorage.getItem('hot')).wpversion);

		$$('#recently_date_left').text('( ' + JSON.parse(window.sessionStorage.getItem('recently')).date + ' )');
		$$('#recently_date_main').text('( ' + JSON.parse(window.sessionStorage.getItem('recently')).date + ' )');

		$$('#funcstotal').text(JSON.parse(window.sessionStorage.getItem('function_list')).total);

		setTimeout(function() {
			wpseek.hidePreloader();
    	}, 500);
	}
};


wpseek.buildQuickAccessList = function () {
	var wpsQuickAdd = JSON.parse(window.localStorage.getItem('wps_quick_list')) || wpsQuickAdded;
	var quickaccess = Template7.templates.quickAccessTemplate(wpsQuickAdd);
	$$('.quickaccess-results').html(quickaccess);
};


var searchTimeout;
wpseek.searchFunction = function (search) {
	var query = encodeURIComponent(search);
	var q = window._apiUrl + 'app/function/related/' + query + '.json?limit=20';
	if (searchTimeout) clearTimeout(searchTimeout);
	$$('.popup .preloader').show();
	searchTimeout = setTimeout(function () {
		$$.get(q, function (results) {
			var html = '';
			results = JSON.parse(results);
			$$('.popup .preloader').hide();
			if( results.items.length > 0 ) {
				var functions = results.items;
				html = Template7.templates.searchResultsTemplate(functions);
			}
			$$('.popup .search-results').html(html);
		});
	}, 300);
};

$$('.popup input[type="text"]').on('change keyup keydown', function () {
	wpseek.searchFunction(this.value);
});
$$('.popup').on('closed', function () {
	$$('.popup input[type="text"]').val('');
	$$('.popup .search-results').html('');
	$$('.popup .preloader').hide();
});
$$('.popup').on('open', function () {
	$$('.views').addClass('blured');
	$$('.statusbar-overlay').addClass('with-popup-opened');
});
$$('.popup').on('opened', function () {
	$$('.popup input[type="text"]')[0].focus();
});
$$('.popup').on('close', function () {
	$$('.views').removeClass('blured');
	$$('.popup input[type="text"]')[0].blur();
	$$('.statusbar-overlay').removeClass('with-popup-opened');
});
$$('.popup .search-results').on('click', 'li', function () {
	var li = $$(this);
	var slug = li.attr('data-name');

	var q = window._apiUrl + 'app/function/info/' + slug + '.json';
	$$.get(q, function (results) {
		var html = '';
		results = JSON.parse(results);
		if( results.status == 'ok' ) {
			mainView.router.load({
				url: 'item-func.html?s=' + slug
			});
		} else {
			navigator.notification.alert('Unable to get content for ' + slug, null, 'Error', 'Close');
		}
	});
});


$$('.popover a').on('click', function() {
	wpseek.closeModal('.popover');
});

$$('.panel-left').on('open', function () {
	$$('.statusbar-overlay').addClass('with-panel-left');
});

$$('.panel-left').on('close', function () {
	$$('.statusbar-overlay').removeClass('with-panel-left');
});

document.addEventListener("offline", function (e) {
	wpseek.alert('You seem to be offline. You need a proper internet connection in order for wpssek for iOS to work.');
}, false);


var wpseek_app = {
	run: function() {
        this.bindEvents();
    },

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function() {
    	wpseek.run(true);
    }
};