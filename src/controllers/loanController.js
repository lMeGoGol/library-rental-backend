const Book = require("../models/Book");
const User = require("../models/User");
const IssuedBook = require("../models/IssuedBook");
const { discountPercent, calcTotal, calcPenalty } = require("../utils/pricing");

// Book issue
exports.issue = async (req, res) => {
    try {
        if (!["admin", "librarian"].includes(req.user.role)) {
            return res.status(403).json({ message: "Access denied" });
        }
    
        const { userId, bookId, days } = req.body;

        const [reader, book] = await Promise.all([
            User.findById(userId),
            Book.findById(bookId)
        ]);

        if (!reader) return res.status(400).json({ message: "User not found" });
        if (!book) return res.status(400).json({ message: "Book not found" });
        if (!book.available) return res.status(400).json({ message: "Book is not available" });
        
        const expectedReturnDate = new Date(Date.now() + (days * 24 * 60 * 60 * 1000));

        const discount = discountPercent(reader.discountCategory);
        const totalRent = calcTotal(book.rentPrice, days, discount);

        const loan = await IssuedBook.create({
            book: book._id,
            reader: reader._id,
            issueDate: new Date(),
            expectedReturnDate,
            rentPerDay: book.rentPrice,
            days,
            discountCategory: reader.discountCategory,
            discountPercent: discount,
            totalRent,
            deposit: book.deposit,
            status: "issued"
        });

        book.available = false;
        await book.save();

        res.status(201).json({
            loan,
            payableNow: loan.totalRent + loan.deposit
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// Return book
exports.returnLoan = async (req, res) => {
    try {
        if (!["admin", "librarian"].includes(req.user.role)) {
            return res.status(403).json({ message: "Access denied" });
        }
    
        const { damaged = false, damageFee = 0 } = req.body;

        const loan = await IssuedBook.findById(req.params.id).populate("book reader");
        if (!loan) return res.status(404).json({ message: "Loan not found" });
        if (loan.status === "returned") return res.status(400).json({ message: "Already returned" });

        loan.actualReturnDate = new Date();
        loan.penalty = calcPenalty(loan.expectedReturnDate, loan.actualReturnDate);
        loan.damageFee = damaged ? Math.max(0, Number(damageFee) || 0) : 0;
        loan.status = "returned";

        loan.book.available = true;

        await Promise.all([loan.save(), loan.book.save()]);

        const depositBack = Math.max(0, loan.deposit - loan.penalty - loan.damageFee);
        const extraToPay = Math.max(0, (loan.penalty + loan.damageFee) - loan.deposit);

        res.json({
            loan,
            settlement: {
                depositPaid: loan.deposit,
                penalty: loan.penalty,
                damageFee: loan.damageFee,
                depositReturned: depositBack,
                extraToPay: extraToPay
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// List of issued books
exports.list = async (req, res) => {
    try {
        let items;

        if (req.user.role === "reader") {
            items = await IssuedBook.find({ reader: req.user.id }).populate("book");
        } else {
            items = await IssuedBook.find().populate("book reader");
        }
    
        res.json(items);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};