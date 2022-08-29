import { readFileSync } from 'fs';

export class Product {
    private id: number;

    // Explicit data from the input
    private normalPrice: number;
    private clearancePrice: number;
    private quantity: number;
    private isPriceHidden: boolean;
    private type: string;

    constructor(np: number, cp: number, q: number, ih: boolean) {

        // The interpreter throws an error when I don't explicitly declare
        // a value for id, saying "Object is possibly 'undefined'". 
        // Given the constraints of the data input (which I point out in a comment below),
        // and the order in which I initialize objects, this should be impossible. 
        // I'm declaring a default value of -1 to bypass this error.
        this.id = -1;
        
        this.normalPrice = np;
        this.clearancePrice = cp;
        this.quantity = q;
        this.isPriceHidden = ih;

        if (this.normalPrice == this.clearancePrice) {
            this.type = "normal";
        } else {
            this.type = "clearance";
        }
    }

    public getNormalPrice() : number {
        return this.normalPrice;
    }

    public getClearancePrice() : number {
        return this.clearancePrice;
    }

    public getQuantity() : number {
        return this.quantity;
    }

    public getIsPriceHidden() : boolean {
        return this.isPriceHidden;
    }

    public getType() : string {
        return this.type;
    }    

    public setID(id: number) {
        this.id = id;
    }

    public getID(): number {
        return this.id;
    }
}

export class PriceType {
    private id: string;
    private displayName: string;
    private products: Map<number, Product>;

    constructor(idKey: string, dn: string) {
        this.id = idKey;
        this.displayName = dn;

        this.products = new Map();
    }

    public getID() : string {
        return this.id;
    }

    public getDisplayName() : string {
        return this.displayName;
    }

    public getProducts() : Map<number, Product> {
        return this.products;
    }

    public addProduct(id: number, product: Product) {
        this.products.set(id, product);
    }
}

export class CodingAssessment {
    private filename: string;
    private result: string;
    private typeMap: Map<string, PriceType>;

    constructor(args: string) {
        this.filename = args;
        this.result = "";

        this.typeMap = new Map();
        
        this.processData();
        this.setResult();
    }

    processData() {
        var fileLocation = "";
        if (this.filename && this.filename[0] == '~') {
            const os = require("os");
            const userHomeDir = os.homedir();

            fileLocation += userHomeDir + '\\';
            fileLocation += this.filename.split("~")[1];
        } else {
            fileLocation = this.filename;
        }

        var data = readFileSync(fileLocation, 'utf-8');
        data.split(/\r?\n/).forEach(row => {
            var columns = row.split(',');

            // In the example data, the Price Types always come in the input before
            // the list of Product Types. This appears to be deliberate, so I'm structuring
            // my classes in a way that assumes that all Price Types will have been defined
            // prior to populating all the products. That way, every Price Type can have a Map
            // of Products associated with it as a class member.
            //
            // If the input data were shuffled around, and a Product of a certain Price Type
            // appeared prior to that Price Type's declaration in the input data, this program
            // would throw an error.
            switch (columns[0]) {
                case "Type": 
                    var type = new PriceType(columns[1], columns[2]);
                    this.typeMap.set(columns[1], type);
                    break;
                case "Product":
                    // Don't bother populating the list of available products for sale
                    // with this item if its quantity is less than 3
                    if (Number(columns[3]) >= 3) {
                        var product = new Product(Number(columns[1]), Number(columns[2]), Number(columns[3]), (columns[4].toLowerCase() == 'true'));
                        var productPriceType = product.getType();
    
                        var priceType = this.typeMap.get(productPriceType);
                        var productCount = 0;
                        if (typeof priceType?.getProducts().size != 'undefined') {
                            productCount = priceType?.getProducts().size + 1;
                        }
                        product.setID(productCount);
                        priceType?.addProduct(productCount, product);

                        // "Any products denoted as "Price In Cart" can also be counted as normal price or clearance products when applicable."
                        // My interpretation of this part of the instructions is that there is a 1-to-1 or 1-to-2 relationship of products to price types.
                        // This means that the product can be in the list of products with hidden prices AND either a normally-priced or clearance item. 
                        if (product.getIsPriceHidden() == true) {
                            var picMap = this.typeMap.get('price_in_cart');
                            picMap?.addProduct(productCount, product);
                        }
                    }
                    
                    break;
                default:
                    break;
            }
        });
    }

    private setResult() {
        // Sort the Map of Price Types based on the number of Products 
        // associated with that Price Type
        const sortedMap = new Map([...this.typeMap].sort(
            (a, b) => b[1].getProducts().size - a[1].getProducts().size));

        for (let item of sortedMap.entries()) {
            // Begin populating the result string            
            this.result += item[1].getDisplayName() + ": " + item[1].getProducts().size + " product";
            this.result += (item[1].getProducts().size != 1) ? "s" : "";

            // If the number of products in a certain Price Type is zero,
            // we don't need to continue manipulating its entry in the output.
            // Continue on in the loop to the next Price Type. 
            if (item[1].getProducts().size == 0) {
                this.result += '\n';
                continue;
            }

            this.result += " @ ";

            var products = [...item[1].getProducts()];

            // Declaring these as the largest/smallest possible
            // integers to ensure that they will be assigned their proper 
            // values accordingly on the first run of the loop 
            var minPrice = Number.MAX_SAFE_INTEGER;
            var maxPrice = Number.MIN_SAFE_INTEGER;

            for (let prod of products) {
                if (prod[1].getType() == 'clearance') {
                    if (prod[1].getClearancePrice() < minPrice) {
                        minPrice = prod[1].getClearancePrice();
                    }

                    if (prod[1].getClearancePrice() > maxPrice) {
                        maxPrice = prod[1].getClearancePrice();
                    }
                } else {
                    if (prod[1].getNormalPrice() < minPrice) {
                        minPrice = prod[1].getNormalPrice();
                    }

                    if (prod[1].getNormalPrice() > maxPrice) {
                        maxPrice = prod[1].getNormalPrice();
                    }
                }
            }

            if (minPrice == maxPrice) {
                this.result += minPrice;
            } else {
                this.result += (minPrice + '-' + maxPrice);
            }
            this.result += '\n';
        }
    }

    public getResult() {
        return this.result;
    }
}

const process = require("process")

// I could not figure out a clean way to both allow for input via stdin
// and input via command line arguments. Either I could pass in the file input via stdin,
// but I could not read from the file, or I could read from the file but could not break out 
// of stdin, so the app would be stuck in a loop. Below is the cleanest solution I could 
// come up with for a command line argument input.

var args = process.argv.slice(2)[0];
let assessment = new CodingAssessment(args);
const result = assessment.getResult();
console.log(result);