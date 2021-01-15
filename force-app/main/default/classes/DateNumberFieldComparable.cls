public interface DateNumberFieldComparable extends FieldComparable {
    Boolean isLess(Object recordFieldValue, Object ruleFieldValue);
    Boolean isGreater(Object recordFieldValue, Object ruleFieldValue);
}
