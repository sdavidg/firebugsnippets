
define([
],
function () {

	function DynamicLoader(fc, arrJS, arrCSS, callback_, argArray_)
	{
		var urls = arrJS;
		var callbackFinal = callback_;
		var argArrayFinal = argArray_;
		var callback = null;
		var argArray = null;

		function cargaScript(url)
		{
			if(url.indexOf("chrome://") != 0)
			{
				throw new Error("External resources are not allowed");
			}
			var script = fc.document.createElement("script");
			script.type = "text/javascript";
			script.src = url;
			script.addEventListener('load', function(){
				done();
			}, false);
			fc.document.getElementsByTagName("head")[0].appendChild(script);
		}

		function loaderSingle(url, callback_, argArray_)
		{
			callback = callback_;
			argArray = argArray_ || [];
			cargaScript(url);
		}

		function done()
		{
			if (callback)
			{
				callback.apply(null, argArray);
			}
		}

		function iCSS(file_path)
		{
			var sc = fc.document.getElementsByTagName("link");
			for (var x in sc)
				if (sc[x].href != null && sc[x].href.indexOf(file_path) != -1) return;
			var l = fc.document.createElement('link');
			l.rel = "stylesheet";
			l.type="text/css"
			l.href = file_path;
			fc.document.getElementsByTagName('head')[0].appendChild(l);
		}

		function load_()
		{
			if(urls.length > 1)
			{
				loaderSingle(urls.shift(),load_);
			}
			else
			{
				for(var i=0; i<arrCSS.length; i++)
				{
					iCSS(arrCSS[i]);
				}
				if(urls.length == 1)
				{
					loaderSingle(urls.shift(),callbackFinal,argArrayFinal);
				}
			}
		}
		this.load = function(){load_();}
	}

// ********************************************************************************************** //
// Registration
return DynamicLoader;

// ********************************************************************************************** //
});
