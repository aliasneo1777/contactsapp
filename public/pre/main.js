var app=angular.module('codecraft', [
	'ngResource',
	'infinite-scroll',
	'angularSpinner',
	'jcs-autoValidate',
	'angular-ladda'
	]);

app.config(function($httpProvider,$resourceProvider){
	$httpProvider.defaults.headers.common['Authorization'] = 'Token';
	$resourceProvider.defaults.stripTrailingSlashes = false;
});

app.factory("Contact", function ($resource) {
	return $resource("https://codecraftpro.com/api/samples/v1/contact/:id/", {id: '@id'}, {
		update: {
			method: 'PUT'
		}
	});
});

app.controller('PersonDetailController',function($scope, ContactService){
	$scope.contacts=ContactService;

	$scope.save=function(){
		$scope.contacts.updateContact($Scope.contacts.selectedPerson)
	}
});
	
app.controller('PersonListController',function($scope, ContactService){
	
	$scope.search="";
	$scope.order="email";
	$scope.contacts=ContactService;

	$scope.loadMore=function(){
		console.log('load more');
		$scope.contacts.loadMore();
	};

	$scope.$watch('search', function(newVal,oldVal){
		if(angular.isDefined(newVal)){
			$scope.contacts.doSearch(newVal);
		}
	});

	$scope.$watch('order', function(newVal,oldVal){
		if(angular.isDefined(newVal)){
			$scope.contacts.doOrder(newVal);
		}
	});
});

app.service('ContactService', function (Contact) {

	var self= {
		'addPerson': function (person) {
			this.persons.push(person);
		},
		'page':1,
		'hasMore':true,
		'isLoading':false,
		'isSaving':false,
		'selectedPerson': null,
		'persons': [],
		'search':null,
		'doSearch':function(search){
			self.hasMore=true;
			self.page=1;
			self.persons=[];
			self.search=search;
			self.loadContacts();
		},
		'doOrder':function(order){
			self.hasMore=true;
			self.page=1;
			self.persons=[];
			self.ordering=order;
			self.loadContacts();
		},
		'loadContacts':function(){
			if(self.hasMore && !self.isLoading){
				self.isLoading=true;

				var params = {
					'page': self.page,
					'search':self.search,
					'ordering':self.ordering
				};

				Contact.get(params, function(data){
				console.log(data);
				angular.forEach(data.results,function(person){
					self.persons.push(new Contact(person));
				});

				if(!data.next){
					self.hasMore=false;
				}
				self.isLoading=false;
			});
			}
		},
		'loadMore':function(){
			if(self.hasMore&&!self.isLoading){
				self.page+=1;
				self.loadContacts();
			}
		},
		'updateContact':function(person){
				console.log("Service update");
				self.isSaving=true;
				person.$update().then(function(){
					self.isSaving=false;
				});
			}
		};
	self.loadContacts();
	return self;
});
