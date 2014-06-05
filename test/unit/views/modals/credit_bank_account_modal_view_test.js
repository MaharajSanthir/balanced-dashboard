module("Balanced.CreditBankAccountModalView.CreditBankAccountBuilder");

test("#amount", function(assert) {
	var subject = Balanced.CreditBankAccountModalView.ObjectCreatorClass.create();

	subject.set("dollar_amount", "10.00");
	assert.deepEqual(subject.get("amount"), "1000");

	subject.set("dollar_amount", "vrnvr");
	assert.deepEqual(subject.get("amount"), undefined);
});
