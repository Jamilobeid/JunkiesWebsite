using Junkies.Api.Models;

namespace Junkies.Api.Data;

public static class DbSeeder
{
    public static void Seed(AppDbContext db)
    {
        if (db.Categories.Any())
        {
            return;
        }

        var categories = new List<Category>
        {
            Category("Appetizers", 1, [
                Item("Loaded Fries", "French fries with three optional sauces.", 350000),
                Item("Loaded Chicken-Fries", "Crispy chicken, fries, and three optional sauces.", 470000),
                Item("Jalapeno Bites", "Five jalapeno bites.", 300000),
                Item("Chicken Balls", "Ten fried chicken balls with honey mustard sauce.", 300000),
                Item("Chicken Wings", "Eight pieces with BBQ, Buffalo, and honey mustard.", 350000),
                Item("Nuggets", "Six chicken nuggets with ketchup sauce.", 250000),
                Item("Cheesy Combo", "Cheese balls, jalapeno bites, cheddar sticks, and mozzarella sticks.", 450000)
            ]),
            Category("Platters", 2, [
                Item("Crispy Platter", "Five crispy pieces with french fries, coleslaw, and aioli sauce.", 700000),
                Item("Grilled Chicken Salad", "Grilled boneless chicken, iceberg, tomato, corn, and honey mustard.", 540000),
                Item("Chicken Caesar Salad", "Grilled chicken, iceberg, croutons, toasted bread, parmesan, and Caesar sauce.", 540000),
                Item("Crab Salad", "Crab, iceberg, corn, tomato, carrot, pineapple, orange, cucumber, and special sauce.", 540000),
                Item("Lava Salad Crab", "300g crab with iceberg, corn, exotic fruits, and lava sauce.", 990000)
            ]),
            Category("Drinks", 3, [
                Item("Water", "Chilled bottled water.", 30000),
                Item("Soft Drink Can", "Pepsi, Pepsi Diet, 7 Up, 7 Up Diet, or Miranda.", 100000),
                Item("Lipton Iced Tea", "Cold Lipton iced tea.", 100000)
            ]),
            Category("Beef Burgers", 4, [
                Item("Classic Beef Burger", "Beef, coleslaw, tomato slice, onion, pickles, ketchup, and french fries.", 400000),
                Item("Truffle", "Beef, truffle sauce, mushroom sauce, rocket, cheddar, cheddar slices, caramelized onion.", 500000),
                Item("Swiss Mushroom", "Beef, rocket, honey mustard, creamy mushroom sauce, cheddar slice, and classic special sauce.", 480000),
                Item("Double Swiss M", "Double beef, rocket, honey mustard, creamy mushroom sauce, double cheddar slices, and special sauce.", 700000),
                Item("Double Beef Burger", "Double beef, mayonnaise, lollo rosso, iceberg, honey mustard, double cheddar slices, and special sauce.", 700000),
                Item("Double Truffle", "Double beef patty, mozzarella, truffle sauce, mushroom sauce, rocket, cheddar, cheddar slice, and caramelized onion.", 780000),
                Item("Junkies BlackBurger", "Double beef, black bun, spicy patty, provolone, truffle sauce, mushroom sauce, rocket, cheddar, and special sauce.", 900000),
                Item("Royal Beef Burger", "Triple beef, double patty mustard, lollo rosso, iceberg, honey mustard, double cheddar slices, and special sauce.", 990000)
            ]),
            Category("Broasted Chicken", 5, [
                Item("Broasted Medium", "Served with french fries, coleslaw, garlic, and broasted sauce.", 750000),
                Item("Broasted Large", "Served with french fries, coleslaw, garlic, and broasted sauce.", 1350000)
            ]),
            Category("Chicken Burgers", 6, [
                Item("Grilled Chicken", "Grilled chicken, cheddar, mozzarella sticks, aioli, and iceberg.", 550000),
                Item("Crunchy Buffalo", "Crunchy chicken, spicy Buffalo sauce, barbecue, cheddar, honey mustard, iceberg, and Junkies special sauce.", 590000),
                Item("Crunchy BBQ", "Crunchy chicken, BBQ sauce, cheddar, honey mustard, iceberg, and Junkies special sauce.", 590000),
                Item("Crunchy Aioli", "Crunchy chicken, aioli, cheddar, honey mustard, iceberg, and Junkies special sauce.", 590000)
            ]),
            Category("Cheese Burger", 7, [
                Item("Cheese Burger", "Chicken or beef with cheddar slice, iceberg, and special sauce.", 420000)
            ]),
            Category("Chicken Wraps", 8, [
                Item("Boneless Grilled Chicken", "200g boneless chicken with honey mustard, barbecue, cheddar, iceberg, and Junkies special sauce.", 490000),
                Item("Boneless Giant Grilled Chicken", "300g boneless chicken with honey mustard, barbecue, cheddar, iceberg, and Junkies special sauce.", 620000)
            ]),
            Category("Desserts", 9, [
                Item("Lotus Cup", "Sweet Lotus dessert cup.", 400000),
                Item("Oreo Cup", "Creamy Oreo dessert cup.", 400000),
                Item("Strawberry Cup", "Fresh strawberry dessert cup.", 400000),
                Item("Chocolate Burger", "Coming soon dessert burger.", 0)
            ]),
            Category("Extras", 10, [
                Item("Jalapeno", "Extra jalapeno topping.", 50000),
                Item("Sauce", "Extra sauce cup.", 50000),
                Item("Coleslaw", "Side coleslaw.", 100000),
                Item("Mozzarella Sticks", "Two pieces.", 120000),
                Item("Patty Mozzarella", "Extra patty mozzarella.", 120000),
                Item("Crispy Strips", "Two pieces.", 250000),
                Item("French Fries", "Fresh fries side.", 200000)
            ])
        };

        db.Categories.AddRange(categories);
        db.SaveChanges();
    }

    private static Category Category(string name, int sortOrder, List<MenuItem> items) =>
        new() { Name = name, SortOrder = sortOrder, MenuItems = items };

    private static MenuItem Item(string name, string description, decimal price) =>
        new() { Name = name, Description = description, Price = price };
}
