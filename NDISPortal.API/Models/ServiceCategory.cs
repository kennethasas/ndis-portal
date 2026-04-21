namespace NDIS.API.Model
{
    public class ServiceCategory
    {
        public int Id { get; set; }
        public string name { get; set; }
        public DateTime created_date { get; set; }
        public DateTime modified_date { get; set; }

        public ICollection<Service> Services { get; set; }
    }
}