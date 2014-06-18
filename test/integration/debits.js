module('Debits', {
	setup: function() {
		Testing.setupMarketplace();
		Ember.run(function() {
			Testing._createCard().then(function(card) {
				return Balanced.Debit.create({
					uri: card.get('debits_uri'),
					appears_on_statement_as: 'Pixie Dust',
					amount: 100000,
					description: 'Cocaine'
				}).save();
			}).then(function(debit) {
				Testing.DEBIT_ID = debit.get('id');
				Testing.DEBIT_URI = debit.get('uri');
				Testing.DEBIT_ROUTE = '/marketplaces/' + Testing.MARKETPLACE_ID + '/debits/' + Testing.DEBIT_ID;
			});
		});
	},
	teardown: function() {
		Testing.restoreMethods(
			Balanced.Adapter.create,
			Balanced.Adapter.update
		);
	}
});

test('can visit page', function(assert) {
	visit(Testing.DEBIT_ROUTE).then(function() {
		assert.notEqual($('#content h1').text().indexOf('Debit'), -1, 'Title is not correct');
		assert.equal($(".debit .tt-title").text().trim(), 'Succeeded: $1,000.00');
	});
});

test('can refund debit', function(assert) {
	var spy = sinon.spy(Balanced.Adapter, "create");

	visit(Testing.DEBIT_ROUTE)
		.click(".refund-debit-button")
		.fillIn('#refund-debit .modal-body input[name="dollar_amount"]', "10")
		.click('#refund-debit .modal-footer button[name="modal-submit"]')
		.then(function() {
			assert.ok(spy.calledOnce);
			assert.ok(spy.calledWith(Balanced.Refund));
			assert.equal(spy.getCall(0).args[2].debit_uri, Testing.DEBIT_URI);
			assert.equal(spy.getCall(0).args[2].amount, '1000');
		});
});

test('can edit debit', function(assert) {
	var spy = sinon.spy(Balanced.Adapter, "update");

	visit(Testing.DEBIT_ROUTE)
		.click('.debit .transaction-info a.icon-edit')
		.fillIn('.edit-transaction.in .modal-body input[name="description"]', "changing desc")
		.click('.edit-transaction.in .modal-footer button[name="modal-submit"]')
		.then(function() {
			assert.ok(spy.calledOnce);
			assert.ok(spy.calledWith(Balanced.Debit));
			assert.equal(spy.getCall(0).args[2].description, "changing desc");
		});
});

test('failed debit shows failure information', function(assert) {
	var spy = sinon.spy(Balanced.Adapter, "update");

	visit(Testing.DEBIT_ROUTE)
		.then(function() {
			var model = Balanced.__container__.lookup('controller:debits');
			model.setProperties({
				status: "failed",
				failure_reason: "Foobar"
			});
		})
		.checkElements({
			'.dl-horizontal dd:first': "Foobar"
		});
});

test('failed debit does not show refund modal', function(assert) {
	var spy = sinon.spy(Balanced.Adapter, "update");

	visit(Testing.DEBIT_ROUTE).then(function() {
		var model = Balanced.__container__.lookup('controller:debits');
		model.set('status', 'failed');
		Ember.run.next(function() {
			assert.equal($('#refund-debit').is(':visible'), false);
		});
	});
});

test('renders metadata correctly', function(assert) {
	var spy = sinon.spy(Balanced.Adapter, "update");

	var metaData = {
		'key': 'value',
		'other-keey': 'other-vaalue'
	};

	visit(Testing.DEBIT_ROUTE).then(function() {
		var model = Balanced.__container__.lookup('controller:debits');
		model.set('meta', metaData);

		Ember.run.next(function() {
			var $dl = $('.dl-horizontal.meta');
			$.each(metaData, function(key, value) {
				assert.equal($dl.find('dt:contains(' + key + ')').length, 1);
				assert.equal($dl.find('dd:contains(' + value + ')').length, 1);
			});
		});
	});
});
