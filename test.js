/* eslint-env node, mocha */

var assert = require('assert');
var jsdom = require('jsdom').jsdom;
var callWithMarkup = require('./index');

describe('callWithMarkup', function () {
  it('exports a function', function () {
    assert.equal(typeof callWithMarkup, 'function');
  });

  describe('when called with markup', function () {
    var document;

    beforeEach(function () {
      document = jsdom();
    });

    it('calls back with the given elements', function () {
      callWithMarkup('<hr id="one" /><hr id="two" />', {
        document: document
      }, function (hr1, hr2) {
        assert.equal(hr1.id, 'one');
        assert.equal(hr2.id, 'two');
      });
    });

    it('returns the result of the callback', function () {
      var result = callWithMarkup('<hr />', {
        document: document
      }, function () {
        return true;
      });
      assert.equal(result, true);
    });

    it('doesn’t swallow errors', function () {
      assert.throws(function () {
        callWithMarkup('<hr />', {
          document: document
        }, function () {
          throw new Error('To be expected');
        });
      }, /To be expected/);
    });

    describe('cleans up after itself', function () {
      it('when given a normal result', function () {
        callWithMarkup('<hr id="one" />', {
          document: document
        }, function () {
          return null;
        });
        var foundElementAfterCall = document.getElementById('one');
        assert.equal(foundElementAfterCall, null);
      });

      it('when an error is thrown', function () {
        try {
          callWithMarkup('<hr id="one" />', {
            document: document
          }, function () {
            throw new Error('To be expected');
          });
        } catch (error) {
          if (error.message !== 'To be expected') {
            throw error;
          }
        } finally {
          var foundElementAfterCall = document.getElementById('one');
          assert.equal(foundElementAfterCall, null);
        }
      });

      it('when a returned promise is resolved', function (done) {
        var awaitResult = callWithMarkup('<hr id="one" />', {
          document: document
        }, function () {
          return new Promise(function (resolve) {
            setTimeout(resolve, 5);
          });
        });

        var foundElementBeforeResolve = document.getElementById('one');
        assert.ok(foundElementBeforeResolve);

        awaitResult.then(function () {
          var foundElementAfterResolve = document.getElementById('one');
          assert.equal(foundElementAfterResolve, null);
          done();
        });
      });

      it('when a returned promise is rejected', function (done) {
        var awaitResult = callWithMarkup('<hr id="one" />', {
          document: document
        }, function () {
          return new Promise(function (resolve, reject) {
            setTimeout(reject, 5);
          });
        });

        var foundElementBeforeRejection = document.getElementById('one');
        assert.ok(foundElementBeforeRejection);

        awaitResult.catch(function () {
          var foundElementAfterRejection = document.getElementById('one');
          assert.equal(foundElementAfterRejection, null);
          done();
        });
      });
    });
  });
});
