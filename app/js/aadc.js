
$(document).ready(function () {
	var config;
	$('#form-group').hide();
	$.ajax({
		url: "../config.json",
		type: "GET",
		success: function (response) {
			config = response;
		},
		error: function (jqXHR, textStatus, errorThrown) {
			console.log(textStatus, errorThrown);
		}
	}).then(function(){
		$.ajax({
			url: "/getAppList",
			type: "GET",
			dataType: "JSON",
			success: function (apps) {
				appsList = apps;
				$('div.appMenu select').val('(No app selected)');
				$.each(apps, function (key, value) {
					$("#appMenu").append('<option value=' + value.appId + '>' + value.appName + '</option>');
				});
			},
			error: function (jqXHR, textStatus, errorThrown) {
				console.log(textStatus, errorThrown);
			}
		});
		$('#submitButton').click(function () {
			$.ajax({
				url: "/getExtensions",
				type: "GET",
				data: $.param({ appId: $('#appMenu').find("option:selected").val() }),
				success: function (list) {
					extensionList = [];
					console.log(list.length);
					for (i = 0; i < list.length; i++) {
						if (list[i].qType != 'masterobject' &&
							list[i].qType != 'sheet' &&
							list[i].qType != 'filterpane' &&
							list[i].qType != 'listbox' &&
							list[i].qType != 'linechart' &&
							list[i].qType != 'kpi' &&
							list[i].qType != 'filterpane' &&
							list[i].qType != 'barchart' &&
							list[i].qType != 'treemap' &&
							list[i].qType != 'boxplot' &&
							list[i].qType != 'histogram' &&
							list[i].qType != 'map' &&
							list[i].qType != 'combochart' &&
							list[i].qType != 'text-image' &&
							list[i].qType != 'distributionplot' &&
							list[i].qType != 'waterfallchart' &&
							list[i].qType != 'pivot-table' &&
							list[i].qType != 'scatterplot' &&
							list[i].qType != 'table' &&
							list[i].qType != 'piechart' &&
							list[i].qType != 'gauge' &&
							list[i].qType != 'appprops' &&
							list[i].qType != 'dimension' &&
							list[i].qType != 'measure' &&
							list[i].qType != 'snapshot' &&
							list[i].qType != 'bookmark' &&
							list[i].qType != 'story' &&
							list[i].qType != 'LoadModel' &&
							list[i].qType != 'embeddedsnapshot' &&
							list[i].qType != 'slide' &&
							list[i].qType != 'slideitem' &&
							list[i].qType != 'ColorMap'
						) {
							if (extensionList.indexOf(list[i].qType) == -1) {
								extensionList.push(list[i].qType);
							}
						}
					}
					var zipResponses = [];
					for (i = 0; i < extensionList.length; i++) {
						$.ajax({
							url: "/zipExtension",
							type: "GET",
							data: $.param({ "extName": extensionList[i], "appName": $('#appMenu').find("option:selected").text(), "appId": $('#appMenu').find("option:selected").val() }),
							success: function (response) {
								zipResponses.push(response);
							},
							error: function (jqXHR, textStatus, errorThrown) {
								console.log(textStatus, errorThrown);
							}
						});
					}
					setTimeout(function () {
						console.log(JSON.stringify(zipResponses));
						$('#form').show();
						$('#status').append(document.createTextNode(JSON.stringify(zipResponses)));
					}, 1500);
				},
				error: function (jqXHR, textStatus, errorThrown) {
					console.log(textStatus, errorThrown);
				}
			});
		})
	
		$('#importButton').click(function () {
			importResponses = [];
			$('#file1').change(function() {
				var files = $('#file1')[0].files;
				console.log('files', files);
				for(i=0; i<files.length;i++) {
					if(files[i].name.indexOf('.zip') !== -1) {
						$.ajax({
							url: "/importApp",
							type: "GET",
							data: $.param({ "appFolder": config.appExporterFolder + '/AppExporter/' + files[i].webkitRelativePath, "type": "ext"}),
							success: function (response) {
								importResponses.push(response);
							},
							error: function (jqXHR, textStatus, errorThrown) {
								console.log(textStatus, errorThrown);
							}
						});
					}
					else if(files[i].name.indexOf('.qvf') !== -1){
						var appName = files[i].name.replace(".qvf", "");
						$.ajax({
							url: "/importApp",
							type: "GET",
							data: $.param({ "appFolder": config.appExporterFolder + '/AppExporter/' + files[i].webkitRelativePath, "type": "app", "appName":appName}),
							success: function (response) {
								importResponses.push(response);
							},
							error: function (jqXHR, textStatus, errorThrown) {
								console.log(textStatus, errorThrown);
							}
						});
					}
				}
				setTimeout(function () {
					console.log(importResponses);
					$('#form').show();
					$('#status').append(document.createTextNode(importResponses));
				}, 1500);
			});
			$('#file1').trigger('click');
		})
	});
	
});









