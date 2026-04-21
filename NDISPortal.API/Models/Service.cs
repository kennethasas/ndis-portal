using System.ComponentModel.DataAnnotations.Schema;

namespace Service.API.Model
{
    public class ServiceItem
    {
        public int Id { get; set; }
        public int category_id { get; set; }
        public string name { get; set; }
        public string description { get; set; }
        public bool is_active { get; set; }
        public DateTime created_date { get; set; }
        public DateTime modified_date { get; set; }


        //NAVIGATION PROPERTY

        [ForeignKey("category_id")]
        public ServiceCategory ServiceCategory { get; set; }
    }
}
