The primary question I had to address when desigining my implementation of this problem was how to structure
the data I received on input.

I created Maps to hold the input data, as that made it easier to reference specific elements when only one object
reference was needed, while still being able to easily to iterate through all elements in a given Map if need be.

When I first started building out my implementation, I originally had two Maps, one for all Price Types, and one for
all Product types. Once I got to trying to generate a report for output, I realized that having two lists was not going
to work, and I opted instead to have each object of type Price Type have a class member that was of type Map<number, ProductType>.

This made it easy to associate all products with their respective Price Type as soon as they were created, rather than
have to analyze the products after they had been created and begun to be processed for data output.

One thing I did not quite understand until I was almost done, was the line 
    "Any products denoted as "Price In Cart" can also be counted as normal price or clearance products when applicable."
I had originally always passed products to the Price Type object for "price_in_cart", and ONLY to the Price Type object for "price_in_cart"
at instantiation if I saw the value "true" in the last column of the input data. I found the use of the phrase "when applicable" to 
be somewhat ambiguous, so I put off what that line could mean until the end of my implementation. 

Eventually, I came to the conculsion that this statement must mean that there is a one-to-many (or simple one-to-two) relationship
between Products and Price Types. Therefore, rather than a Product being labelled as normal OR clearance OR price in cart,
it is labelled as (normal OR clearance) AND price in cart, if that final column is true.

The following is a list of assumptions I made when developing my solution:
1) The order of data input in the example was deliberate. Meaning, it was intended that all Price Types were declared before
   any Products were declared. This made it easier to know how/where to assign the Product objects.
2) There should be a one-to-many relationship of Price Types to Products. This was a core feature of my design, and 
   my implementation would not work if that fact were to change.
3) There is a one-to-one or one-to-to relationship of Products to Price Types.
   The same Product can be associated with multiple Price Types (specifically, price in cart and one other type)

The following is a rough outline of how my code executes. I followed OOP principles in designing my implementation,
but I kept all class declarations in one file since this is a small-scale and short-turnaround assignment.


******************** Data Population ********************
1) Declare classes for both Product and PriceType (lines 3, 63)
2) Declare a class CodingAssessment that contains my actual problem implementation (line 92)
3) On runtime, create an object of type CodingAssessment and pass the input parameter filepath to its constructor lines (231-232)
4) Read in from the input file and save it to a local variable, data, taking into consideration the requirements that the script
   should be able to be run via multiple input types (lines 108 - 119)
5) Read the file line by line, and then split each line into columns (lines 120 - 165)
6) I'm a fan of using switch/case statements for any cases that aren't strictly binary, so I wrote a switch/case statement
   for if the first column represented a Type or a Product
7) I create a new object for each object listed as a Type
8) I create a new object for each object listed as a Product, but ONLY IF the value in the column representing the product's 
   quantity is equal to 3 or more products. (Lines 140 - 159)
9) Inside the constructor for the Product class I determine if the product is a normally priced item or a clearance
   item by comparing the values of the normal and clearance principles (line 27)
11) I add the product object to the Map of products in the relevant Price Type based on the parameters laid out in the github example,
    as well as giving it a unique id value to make it easy to look up that object
10) If the product is flagged as having a hidden price, I also add it to the map of products for the price_in_cart Price Type object (line 155 - 159)

******************** Data Processing ********************
1) Firstly, I sort my Map of Price Types based on which Price Type has the most number of products (line 171 - 172)
2) Then, I iterate through each Product in each Price Type
3) I make sure to add some checks to make sure the output is syntactically correct for the English language (ex. no 's' following a word representing only one item)
4) Since I know I'm going to have to visit every element in the Products map in each Price Type, I convert the map to an array. 
   Having a map is not an advantage anymore, and for me it's much easier to access the data in each Product object this way (line 189)
5) One of the tricky issues I ran into was how to handle the maximum and minimum prices of all product items in each Price Type. I couldn't
   start at zero for the minimum, for example, because no item will ever be sold for zero dollars, so comparing the current item in the loop's price
   to zero would never update my minimum value. Eventually I realized that if I set the initial value to minPrice to the absolute highest integer value, 
   and the value of maxPrice to the smallest possible integer value, I could get around the issue of how to instantiate those two values.
   It is highly unlikely (and mathematically impossible) that anything would be sold for those prices, so it made it easy to create ACTUAL initial
   values for those two variables. Then, for every run of the loop, I compared the current product's price to the values of the minimum and maximum price
   as-needed, taking care to pay attention to if the product was on clearance or not (lines 194 - 215)
6) I use all this data and all these checks to append a string, which is then console.log'ed at runtime