public interface FieldComparable {
    Boolean compareFields(Object recordFieldValue, String operator, Object ruleFieldValue);
}