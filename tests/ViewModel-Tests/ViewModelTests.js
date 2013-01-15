var getSheetForTests = function(){
    return new Sheet();
}


module("SingleValueViewModel Tests");
test("SingleValueViewModel updates its value when its SingleValueSource changes its value", function() {
	//Arrange
	var svs = new SingleValueSource();
	svs.Value(1);
	var vm = new SingleValueViewModel({valueSource:svs}, getSheetForTests());
	var viewModelRaisedEvent = false;
	vm.value.subscribe(function(){viewModelRaisedEvent = true});


	//Act
	svs.Value(2);

	//Assert
	ok(viewModelRaisedEvent);
	equal(vm.value(), 2);
})

test("Changing the definition on a SingleValueViewModel updates the definition on its SingleValueSource", function() {
	//Arrange
	var svs = new SingleValueSource();
	svs.Definition("0");
	var vm = new SingleValueViewModel({valueSource:svs}, getSheetForTests());

	//Act
	vm.definition("1");

	//Assert
	equal(svs.Definition(), "1");
})

test("Setting requestedName on a SingleValueViewModel causes it to call trySetName on the sheet it was constructed with, ",function(){
	//Arrange
	var itemToAdd = new SheetElement(new SingleValueSource(), {x:0,y:0});
	
	var functionWasCalled = false;
	var itemPassedInFunction;
	var nameRequestedInFunction;
	var sheet = {
        trySetName:function(item, requestedName){
		    functionWasCalled=true;
		    itemPassedInFunction = item;
		    nameRequestedInFunction = requestedName;
	    },
        bind:function(){}
    };

	var vm = new SingleValueViewModel(itemToAdd, sheet);

	//Act
	vm.requestedName("Foo");

	//Assert
	ok(functionWasCalled);
	strictEqual(itemPassedInFunction, itemToAdd);
	strictEqual(nameRequestedInFunction, "Foo");
});

test("SingleValueViewModel name property takes its value from name assigment on sheet", function(){
	//Arrange
	var sheetModel = new Sheet();
	var sheetVM = new SheetVM(sheetModel);

	var item = new SheetElement(new SingleValueSource(), {x:0,y:0})
	sheetModel.addItem(item);

	var itemVM = sheetVM.items()[0];
	equal(itemVM.name(), undefined);

	//Act
	var chosenName = "foo";
	sheetModel.trySetName(item, chosenName);

	//Assert	
	equal(itemVM.name(), chosenName);
});

module("SheetViewModel Tests");
test("When the Sheet model adds an item, the SheetViewModel adds a corresponding ItemViewModel", function(){
	//Arrange
	var sheetModel = new Sheet();
	var sheetVM = new SheetVM(sheetModel);
	var vmRaisedEvent = false;
	sheetVM.items.subscribe(function(){vmRaisedEvent = true});
	equal(sheetVM.items().length, 0);

	var itemToAdd = new SingleValueSource();

	//Act
	sheetModel.addItem({valueSource:itemToAdd});

	//Assert
	ok(vmRaisedEvent);
	equal(sheetVM.items().length, 1);
});

test("When sheet model assigns a name, view model for that item changes its name", function(){
	//Arrange
	var sheet = new Sheet();
	var item = new SheetElement(new SingleValueSource(), {x:0,y:0});
	
	var sheetVM = new SheetVM(sheet);
    
	sheet.addItem(item);
    var itemVM = sheetVM.items()[0];

	//Act
	sheet.trySetName(item, "Foo");


	//Assert
	equal(itemVM.name(), "Foo");
});

