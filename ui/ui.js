var SingleValueViewModel = (function(){

	var constructor = function(sheetEntity, hostingSheet){
		var self = this;
		var valueObject = sheetEntity.valueSource;
		
		//public properties
		self.position      = ko.observable(sheetEntity.position);
		self.value         = ko.observable(valueObject.Value());
		self.definition    = ko.observable(valueObject.Definition());
		self.requestedName = ko.observable();
        self.name          = ko.observable();
		self.isEditing     = ko.observable(true);


		//Subscribe to model events
		valueObject.bind('valueChanged', function(newValue){
			self.value(newValue);
		});
        
        hostingSheet.bind('nameAssigned', function(nameRecord){
            if(nameRecord.item == sheetEntity)
            {
                self.name(nameRecord.name);
            }
            
		});

		
		// Update the model when our observables change
		self.definition.subscribe(function(newDefinitionValue){
			valueObject.Definition(newDefinitionValue);
		});

		self.requestedName.subscribe(function(name){
			hostingSheet.trySetName(sheetEntity, name);
		});

		
		//public methods
		self.startEditing = function(data, event){
			self.isEditing(true);
			self.trigger('startedEditing',self);
		};

		self.keypressed = function(data, event){
			if(event.keyCode == 13)
			{
				event.stopPropagation();
				self.isEditing(false);
			}
			return true;
		};

	};

	MicroEvent.mixin(constructor);
	return constructor;
})();


var SheetVM = (function(){

	return function(sheetModel){
		var self = this;
		var sheet = sheetModel;
		

		//public properties
		self.items = ko.observableArray();


		//subscribe to model events
		sheet.bind('itemAdded', function(newItem){
			var itemVM = new SingleValueViewModel(newItem, sheet);

			itemVM.bind('startedEditing', onActiveItemChanged);
			itemVM.requestedName.subscribe(function(newName){
				sheet.trySetName(newItem, newName)
			});

		    self.items.push(itemVM);
			onActiveItemChanged(itemVM);
		});

		
		//public methods
		self.addItemAtPosition = function(position){
			var svs = new SingleValueSource(new SimpleEvaluator()); //note: this should be done by the sheet, or something in core
			var item = new SheetElement(svs, position);
			
			sheet.addItem(item);
		};

		self.clicked = function(data, event){
			var vmForClickTarget = ko.dataFor(event.target);
			if(vmForClickTarget.sheet != self)
				return; //We are only interested in clicks directly on sheet, not events bubbling up

			var pos = {x:event.pageX + "px", y:event.pageY + "px"};
			self.addItemAtPosition(pos);
		}


		//private methods
		var onActiveItemChanged = function(newActiveItem){		
			var itemsToDeactivate = self.items().filter(function(item){
				return item !== newActiveItem
			});
			
			itemsToDeactivate.forEach(function(item){
				item.isEditing(false);
			});
		};
	}
})();



var RootViewModel = (function(){
	return function(){
		var self = this;

		self.sheet = new SheetVM(new Sheet());
	};
})();



