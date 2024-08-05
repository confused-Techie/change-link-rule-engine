const File = require("../src/file.js");

describe("Can Match", () => {
  test("Can match the 'package.json' with relative paths", () => {
    const file = new File("package.json", {
      extension: ".json",
      directory: "./package.json"
    });

    expect(file.run()).toBeTruthy();
  });

  test("Can match the 'package.json' with regular paths", () => {
    const file = new File("package.json", {
      extension: ".json",
      directory: "package.json"
    });

    expect(file.run()).toBeTruthy();
  });

  test("Can match based on extension alone", () => {
    const file = new File("package.json", {
      extension: ".json"
    });

    expect(file.run()).toBeTruthy();
  });

  test("Can match based on directory alone", () => {
    const file = new File("package.json", {
      directory: "package.json"
    });

    expect(file.run()).toBeTruthy();
  });

  test("Can match file within folder", () => {
    const file = new File("./src/file.js", {
      directory: "./src/*"
    });
    console.log("tester");
    expect(file.run()).toBeTruthy();
  });

});

describe("Can fail to match", () => {
  test("Fails to match based on extension", () => {
    const file = new File("package.json", {
      extension: ".js"
    });

    expect(file.run()).toBeFalsy();
  });

  test("Fails to match based on directory", () => {
    const file = new File("package.json", {
      directory: "./src/*"
    });

    expect(file.run()).toBeFalsy();
  });

  test("Fails to match with notDirectory", () => {
    const file = new File("./src/file.js", {
      not_directory: "./src/*"
    });

    expect(file.run()).toBeFalsy();
  });
});
