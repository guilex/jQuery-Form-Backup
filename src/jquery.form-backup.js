(function($, window){

	window.formBackupData = {};

	// util
	if (typeof String.prototype.startsWith != 'function') {
		String.prototype.startsWith = function (str){
		return this.slice(0, str.length) == str;
		};
	}

	var namespace = 'form-backup';
	var backupId = new Date().getTime();

	// cache
	var $backable = $('[data-backup-field]');

	function checkIfBackupAvailable()
	{
		setBackupData();

		var backups = window.formBackupData;

		if(!$.isEmptyObject(backups))
		{
			var notificationWrapper = $('<div>', {'class': 'backupNotification'});
			var notificationText = $('<span>', {text: 'Backup Available: '});

			var select = $('<select>', {id: 'backupSelect'});

			$.each(backups, function(key, item)
			{
				var time = moment.unix(key/1000).fromNow();
				var option = $('<option>', {
					value: key,
					text: time
				});
				option.appendTo(select);
			});


			var restoreButton = $('<button>', {text: 'restore'}).on('click', function()
			{
				restoreBackup(select.val());
			});

			var clearButton = $('<button>', {text: 'remove all backups'}).on('click', function()
			{
				clearAll();
			});

			notificationText.appendTo(notificationWrapper);
			select.appendTo(notificationWrapper);
			restoreButton.appendTo(notificationWrapper);
			clearButton.appendTo(notificationWrapper);

			$('body').prepend(notificationWrapper);
		}
	}

	function backupAllFields()
	{
		$.each($backable, function(i, item)
		{
			backupField($(item).attr('name'), $(item).val());
		});
	}

	function backupField(key, value)
	{
		fullKey = namespace + '.' + backupId + '.' + key;

		window.localStorage.setItem(fullKey, value);
		console.log('backupped: ' + key);
	}

	function restoreBackup(id)
	{
		var backups = window.formBackupData;
		
		var backupFields = backups[id];

		if(backupFields !== undefined)
		{
			$.each(backupFields, function(i, item){
				var input = $('[name='+item.key+'][data-backup-field]');
				if(input)
				{
					input.val(item.value);
				}
			});
		}
	}

	function clearAll()
	{
		window.formBackupData = {};
		
		// using this is temp.
		window.localStorage.clear();

		// this is not working for some reason?
		for (var i = 0; i < window.localStorage.length; i++){

			var fullKey = window.localStorage.key(i);

			if(fullKey.startsWith(namespace))
			{
				window.localStorage.removeItem(fullKey);
			}
		}
	}

	// get data from local storage
	function setBackupData()
	{
		for (var i = 0; i < window.localStorage.length; i++){
			
			var fullKey = window.localStorage.key(i);

			if(fullKey.startsWith(namespace))
			{
				var tempArr = fullKey.split('.');
				var backupId = tempArr[1];
				var key = tempArr[2];
				var value = window.localStorage.getItem(fullKey);
				
				if(!window.formBackupData[backupId]){
					window.formBackupData[backupId] = [];
				}

				window.formBackupData[backupId].push({
					key: key,
					value: value
				});
			}
		}
	}

	//
	checkIfBackupAvailable();

	// bind events
	$(window.document).on('blur', '[data-backup-field]', backupAllFields);

})(jQuery, window);