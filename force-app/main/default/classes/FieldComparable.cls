public interface FieldComparable {
    Boolean isNull(Object recordFieldValue, Object ruleFieldValue);
    Boolean isEquals(Object recordFieldValue, Object ruleFieldValue);
    Boolean isNotEquals(Object recordFieldValue, Object ruleFieldValue);
}