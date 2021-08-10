const {
  isMainThread,
  parentPort
} = require("worker_threads");
const assert = require("assert");
const NodeGit = require("../../");
const { promisify } = require("util");

var RepoUtils = require("repository_setup");
var path = require("path");
var local = path.join.bind(path, __dirname);

if (isMainThread) {
  throw new Error("Must be run via worker thread");
}

parentPort.postMessage("init");

var Blame = NodeGit.Blame;

var test;
var fileName = "foobar.js";
var repoPath = local("../repos/blameRepo");

let creaRepo = function() {
  return RepoUtils.createRepository(repoPath)
    .then(function(repository) {
      test.repository = repository;

      return RepoUtils.commitFileToRepo(
        repository,
        fileName,
        "line1\nline2\nline3"
      );
    });
};

creaRepo();

return Blame.file(test.repository, fileName)
  .then(function(blame) {
    assert(blame);
    parentPort.postMessage("success");
    return promisify(setTimeout)(15000);
  }).catch(() => parentPort.postMessage("failure"));
