public interface TextFieldComparable extends FieldComparable {
    Boolean isContains(Object recordFieldValue, Object ruleFieldValue);
    Boolean isNotContains(Object recordFieldValue, Object ruleFieldValue);
}