var app = angular.module('flapperNews', ['ui.router']);

app.config([
	'$stateProvider',
	'$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {

		$stateProvider
			.state('home', {
				url: '/home',
				templateUrl: '/home.html',
				controller: 'MainCtrl',
				resolve: {
					postPromise: ['posts', function(posts) {
						return posts.getAll();
					}]
				}
			})
			.state('posts', {
				url: '/posts/{id}',
				templateUrl: '/posts.html',
				controller: 'PostsCtrl'
			});

		$urlRouterProvider.otherwise('home');

}]);

app.controller('MainCtrl', ['$scope', 'posts', function($scope, posts) {
	$scope.posts = posts.posts;

	$scope.addPost = function() {
		if (!$scope.title || $scope.title === '') { return; }
		posts.create({
			title: $scope.title, 
			link: $scope.link
		});
		$scope.title = '';
		$scope.link = '';
	};

	$scope.incrementUpvotes = function (post) {
		posts.upvote(post);
	}

	$scope.decrementUpvotes = function (post) {
		posts.downvote(post);
	}
}]);

app.factory('posts', ['$http', function($http) {
	var object = {
		posts: []
	};
	object.getAll = function() {
		return $http.get('/posts').success(function(data) {
			angular.copy(data, object.posts);
		})
	};
	object.create = function(post) {
		return $http.post('/posts', post).then(function(data) {
			object.posts.push(data);
		}, function(error) {
			console.log(error);
		});
	};
	object.upvote = function(post) {
		return $http.put('/posts/' + post._id + '/upvote')
			.success(function(data) {
				post.upvotes += 1;
			});
	};
	object.downvote = function(post) {
		return $http.put('/posts/' + post._id + '/upvote')
			.success(function(data) {
				post.upvotes -= 1;
			});
	}
	return object;
}]);

app.controller('PostsCtrl', ['$scope', '$stateParams', 'posts', function($scope, $stateParams, posts) {
	$scope.post = posts.posts[$stateParams.id];

	$scope.addComment = function() {
		if ($scope.body === '') return;
		$scope.post.comments.push({
			body: $scope.body,
			author: 'user',
			upvotes: 0
		});
		$scope.body = '';
	};
}])