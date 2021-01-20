@isTest
public class TestUtility
{
   static Integer sNum = 1;

   public static String getFakeId(String objectApiName) {
        SObjectType sobjectType = Schema.getGlobalDescribe().get(objectApiName);
        String result = String.valueOf(sNum++);
        return sobjectType.getDescribe().getKeyPrefix() + '0'.repeat(12-result.length()) + result;
   }
}
