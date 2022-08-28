const UUIDV4_REGEX = /^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-4[0-9A-Fa-f]{3}-[89ABab][0-9A-Fa-f]{3}-[0-9A-Fa-f]{12}$/

function fuzzyDiff(object1, object2, options, path = "") {
    options = options || {};
    options.ignoreDateTimes = options.ignoreDateTimes || false;
    options.ignoreUUIDs = options.ignoreUUIDs || false;
    options.ignoreArrayOrder = options.ignoreArrayOrder || false;
    options.ignorePaths = options.ignorePaths || [];
    options.ignoreValues = options.ignoreValues || [];
    options.ignoreKeys = options.ignoreKeys || [];

    if (options.ignorePaths.includes(path)) {
        return [];
    }

    if (object1 == null || object2 == null) {
        if (object1 != object2) {
            return [buildDiff(object1, object2, path)];
        }
        return [];
    }

     // Comparing Arrays
     if (Array.isArray(object1)) {
         if (!(Array.isArray(object2))) {
            return [buildDiff(object1, object2, path)];
         }
         if (object1.length != object2.length) {
            return [buildDiff(object1, object2, path)];
         }
         if (options.ignoreArrayOrder) {
            object1.sort(sortFunctionComparator)
            object2.sort(sortFunctionComparator)
         }
         let diffs = [];
         for (let i = 0; i < object1.length; i++) {
             const diff = fuzzyDiff(object1[i], object2[i], options, `${path}[${i}]`);
             if (diff.length !== 0) {
                diffs = diffs.concat(diff);
             }
         }
         return diffs;
     }
    
    // Comparing Objects
    if (object1 instanceof Object) {
        if (!(object2 instanceof Object)) {
            return [buildDiff(object1, object2, path)];
        }

        const object1Keys = new Set(Object.keys(object1).filter(key => !ignoreKey(key, options.ignoreKeys)));
        const object2Keys = new Set(Object.keys(object1).filter(key => !ignoreKey(key, options.ignoreKeys)));
        // If key length differs or different keys, return false
        if (!(object1Keys.size === object2Keys.size &&
            [...object1Keys].every((x) => object2Keys.has(x)))) {
                return [buildDiff(object1, object2, path, "Object keys do not match")];
        }

        let diffs = [];
        object1Keys.forEach(key => {
            const diff = fuzzyDiff(object1[key], object2[key], options, `${path}${path ? "." : ""}${key}`);
            if (diff.length !== 0) {
                diffs = diffs.concat(diff)
            }
        })
        return diffs;
    }

    if (ignoreValues(object1, object2, options.ignoreValues)) {
        return [];
    }

    // Comparing special string cases
    if ((object1 instanceof String || typeof object1 === "string") &&
        (object2 instanceof String || typeof object2 === "string")) {
        if (UUIDV4_REGEX.test(object1) && UUIDV4_REGEX.test(object2) && options.ignoreUUIDs) {
            return [];
        }
        if (!isNaN(Date.parse(object1)) && !isNaN(Date.parse(object2)) && options.ignoreDateTimes) {
            return [];
        }
    }

    // Compare everything else
    if (object1 != object2) {
        return [buildDiff(object1, object2, path)]
    }
    return [];
}

function sortFunctionComparator(a, b) {
    if (Number.isFinite(a) && Number.isFinite(b)) {
        return Number(a) - Number(b);
    }
    const aString = a instanceof Object ? JSON.stringify(a) : a;
    const bString = b instanceof Object ? JSON.stringify(b) : b;
    return aString.localeCompare(bString);
}

function ignoreKey(key, ignoreKeys) {
    for (regex of ignoreKeys){
        if (regex.test(key)) {
            return true;
        }
    }
    return false;
}

function ignoreValues(value1, value2, ignoreValues) {
    for (regex of ignoreValues){
        if (regex.test(value1) && regex.test(value2)) {
            return true
        }
    }
    return false;
}

function buildDiff(object1, object2, path, message) {
    return {
        object1,
        object2,
        path,
        message
    }
}

const FgRed = "\x1b[31m";
const FgGreen = "\x1b[32m";
const Reset = "\x1b[0m";

function printDiffs(diffs) {
    if (diffs.length === 0) {
        console.log(`${FgGreen}%s${Reset}`, "No diffs found! :)");
    }
    diffs.forEach(diff => {
        console.log(`\nFound difference in ${diff.path}!`);
        console.log(`${FgRed}%s${Reset}`, diff.object1);
        console.log(`${FgGreen}%s${Reset}`, diff.object2);
        if (diff.message) {
            console.log(`${FgRed}%s${Reset}`, diff.message);
        }
    })
}


const test1 = {
    "id": "890a92fd-5c1f-4050-b86e-d139073359a5",
    "name": "Jeffrey",
    "occupation1": "cook",
    "occupation2": "teacher",
    "likes": ["fish", "sandals"],
    "createdAt": "2022-08-28T02:24:44.493Z",
};

const test2 = {
    "id": "890a92fd-5c1f-4050-b86e-d139073359a5",
    "name": "Jeffrey",
    "occupation1": "cook",
    "occupation2": "teacher",
    "likes": ["fish", "sandals"],
    "createdAt": "2022-08-28T02:24:44.493Z"
};

const test3 = {
    "id": "890a92fd-5c1f-4050-b86e-d139073359a4",
    "name": "Jeffrey",
    "occupation1": "cook",
    "occupation2": "teacher",
    "likes": ["fish", "sandals"],
    "createdAt": "2022-08-28T02:24:44.493Z"
};

const test4 = {
    "id": "890a92fd-5c1f-4050-b86e-d139073359a5",
    "name": "Jeffrey",
    "occupation1": "cook",
    "occupation2": "teacher",
    "likes": ["fish", "sandals"],
    "createdAt": "2022-08-27T02:24:44.493Z"
};

const test5 = {
    "id": "890a92fd-5c1f-4050-b86e-d139073359a5",
    "name": "Jeffrey",
    "occupation1": "chef",
    "occupation2": "teacher",
    "likes": ["fish", "sandals"],
    "createdAt": "2022-08-28T02:24:44.493Z"
};

const test6 = {
    "id": "890a92fd-5c1f-4050-b86e-d139073359a5",
    "name": "Jeffrey",
    "occupation1": "cook",
    "occupation2": "teacher54654",
    "likes": ["fish", "sandals"],
    "createdAt": "2022-08-28T02:24:44.493Z"
};

const test7 = {
    "id": "890a92fd-5c1f-4050-b86e-d139073359a5",
    "name": "Jeffrey",
    "occupation1": "cook",
    "occupation2": "teacher",
    "likes": ["sandals", "fish"],
    "createdAt": "2022-08-28T02:24:44.493Z"
};


const ultimateTest1 = {
    "id": "890a92fd-5c1f-4050-b86e-d139073359a5",
    "data": {
        "occupation1": {
            "type": "fulltime",
            "value": "teacher",
            "enjoyment": 20
        },
        "likes": [
            {
                "type": "food",
                "value": "fish"
            },
            {
                "type": "footwear",
                "value": "sandals"
            }
        ]
    },
    "createdAt": "2022-08-28T02:24:44.493Z"
}

const ultimateTest2 = {
    "id": "890a92fd-5c1f-4050-b86e-d139073359a4",
    "data": {
        "occupation1": {
            "type": "fulltime",
            "value": "teaserver",
            "enjoyment": 200
        },
        "likes": [
            {
                "type": "footwear",
                "value": "sandals"
            },
            {
                "type": "food",
                "value": "fish"
            }
        ]
    },
    "createdAt": "2022-08-21T02:24:44.493Z"
}

// console.log(fuzzyDiff(test1, test2));
// console.log(fuzzyDiff(test1, test3, {"ignoreUUIDs": false}));
// console.log(fuzzyDiff(test1, test4, {"ignoreDateTimes": true}));
// console.log(fuzzyDiff(test1, test5, {"ignoreKeys": [/occupation*/]}));
// console.log(fuzzyDiff(test1, test6, {"ignoreValues": [/teacher*/]}));
// console.log(fuzzyDiff(test1, test7, {"ignoreArrayOrder": true}));

console.log(printDiffs(fuzzyDiff(ultimateTest1, ultimateTest2, {
    "ignoreUUIDs": true,
    "ignoreDateTimes": true,
    "ignoreKeys": [/enjoyment*/],
    "ignoreValues": [/tea*/],
    "ignoreArrayOrder": true
})));