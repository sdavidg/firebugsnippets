/* See license.txt for terms of usage */

define([
	"firebugsnippets/window/store"
],

function(Store)
{

// ********************************************************************************************** //
// Constants
var Cc = Components.classes;
var Ci = Components.interfaces;

// ********************************************************************************************** //

var ExportImport =
{
	importDefaultSnippets: function(filePath, importSuccessCallback)
	{
		var request = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest);

		request.onload = (event) => {
			var data = event.target.responseText;
			this.importXml(data, importSuccessCallback);
		};

		request.onerror = () => {
			window.alert('Error importing default snippets');
		};
		request.open("GET", filePath, true);
		request.send(null);
	},

	createSnippetsXml: function(windowDocument, successCallback)
	{
		var doc = windowDocument.implementation.createDocument(null, 'snippets', null),
			snippetEl,
			cdataEl,
			codeEl;

		Store.getAll((results) => {
			for (var key in results)
			{
				if (results.hasOwnProperty(key))
				{
					snippetEl = doc.createElement('snippet');
					snippetEl.setAttribute('name', results[key].name);
					codeEl = doc.createElement('code');
					cdataEl = doc.createCDATASection(results[key].code);

					codeEl.appendChild(cdataEl);
					snippetEl.appendChild(codeEl);
					doc.documentElement.appendChild(snippetEl);
				}
			}
			if (successCallback)
				successCallback(doc);
		});
	},

	openFilePicker: function(win, successCallback)
	{
		Components.utils.import('resource://gre/modules/NetUtil.jsm');

		var nsIFilePicker = Components.interfaces.nsIFilePicker;
		var filePicker = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);

		// fixme: l18n
		filePicker.init(win, "Select a File", nsIFilePicker.modeOpen);
		filePicker.appendFilters(nsIFilePicker.filterXML);

		var result = filePicker.show();
		if (result != nsIFilePicker.returnCancel) {
			var file = filePicker.file;

			NetUtil.asyncFetch(file, (inputStream, status) => {
				if (!Components.isSuccessCode(status)) {
					// Handle error!
					return;
				}

				var data = NetUtil.readInputStreamToString(inputStream, inputStream.available());
				if (successCallback)
					successCallback(data);

			});
		}
	},

	importXml: function(xmlString, callback)
	{
		// fixme: validate xml

		var xml = new window.DOMParser().parseFromString(xmlString, 'text/xml'),
			rootElement = xml.documentElement,
			snippets = rootElement.getElementsByTagName('snippet'),
			snippet, name, code, spec;

		for (var i = 0; i<snippets.length; i++)
		{
			snippet = snippets[i];
			name = snippet.getAttribute('name').trim();
			code = snippet.getElementsByTagName('code')[0].textContent.trim();
			spec = {
				name: name,
				code: code
			};
			Store.insert(spec, null);
		}

		if (callback)
			callback();
	},

	saveToFile: function(win, defaultFileName, content, successCallback)
	{
		var nsIFilePicker = Ci.nsIFilePicker;
		var filePicker = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
		filePicker.defaultString = defaultFileName;

		// fixme: l18n
		filePicker.init(win, "Fire Snippets - Export", nsIFilePicker.modeSave);

		var result = filePicker.show();
		if (result == nsIFilePicker.returnOK || result == nsIFilePicker.returnReplace)
		{
			var file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
			file.initWithPath(filePicker.file.path);

			var ostream = FileUtils.openSafeFileOutputStream(file),
				converter = Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter);

			converter.charset = "UTF-8";
			var istream = converter.convertToInputStream(content);

			NetUtil.asyncCopy(istream, ostream, (status) =>
			{
				if (successCallback)
					successCallback();

				//if (!Components.isSuccessCode(status)) {
				// Handle error!
				//	return;
				//}
			});
		}
	},

	createXMLHttpRequest: function()
	{
		return Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest);
	}
};

// ********************************************************************************************** //
// Registration

return ExportImport;

// ********************************************************************************************** //
});






