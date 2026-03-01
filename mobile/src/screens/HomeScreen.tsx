import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
} from "react-native";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

const { width } = Dimensions.get("window");

export default function HomeScreen({ navigation }: any) {
  const [offers, setOffers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<any>(null);

  useEffect(() => {
    const offersQ = query(collection(db, "offers"), orderBy("createdAt", "desc"));
    const requestsQ = query(collection(db, "requests"), orderBy("createdAt", "desc"));

    const unsubOffers = onSnapshot(offersQ, (snapshot) => {
      setOffers(snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) })));
    });

    const unsubRequests = onSnapshot(requestsQ, (snapshot) => {
      setRequests(snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) })));
    });

    return () => {
      unsubOffers();
      unsubRequests();
    };
  }, []);

  const handleTabPress = (index: number) => {
    scrollRef.current?.scrollTo({ x: width * index, animated: true });
    setActiveIndex(index);
  };

  const renderPost = ({ item }: any) => {
    const isOffer = item.quantity !== undefined;

    return (
      <View style={styles.feedCard}>
        <View style={styles.cardAccent} />

        <View style={styles.cardContentRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.feedTitle}>
              {item.title ?? "(Untitled)"}
            </Text>

            {item.category ? (
              <Text style={styles.categoryText}>
                {item.category.toUpperCase()}
              </Text>
            ) : null}
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>
              {isOffer ? "QTY" : "URGENCY"}
            </Text>
            <Text style={styles.statValue}>
              {isOffer
                ? item.quantity ?? "-"
                : item.urgency ?? "-"}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>TrueNeed</Text>

        <View style={styles.tabsContainer}>
          <TouchableOpacity onPress={() => handleTabPress(0)}>
            <Text style={[styles.tabText, activeIndex === 0 && styles.activeTab]}>
              Offers
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleTabPress(1)}>
            <Text style={[styles.tabText, activeIndex === 1 && styles.activeTab]}>
              Requests
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Feed */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        ref={scrollRef}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(index);
        }}
      >
        <FlatList
          data={offers}
          keyExtractor={(item) => item.id}
          renderItem={renderPost}
          style={{ width }}
          contentContainerStyle={{ paddingBottom: 150, paddingTop: 20 }}
        />

        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          renderItem={renderPost}
          style={{ width }}
          contentContainerStyle={{ paddingBottom: 150, paddingTop: 20 }}
        />
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <NavButton
          label="Offer"
          icon={require("../../assets/icons/offer.png")}
          onPress={() => navigation.navigate("CreateOffer")}
        />
        <NavButton
          label="Request"
          icon={require("../../assets/icons/request.png")}
          onPress={() => navigation.navigate("CreateRequest")}
        />
        <NavButton
          label="Inbox"
          icon={require("../../assets/icons/inbox.png")}
          onPress={() => navigation.navigate("MatchInbox")}
        />
        <NavButton
          label="Dashboard"
          icon={require("../../assets/icons/dashboard.png")}
          onPress={() => navigation.navigate("Dashboard")}
        />
      </View>
    </View>
  );
}

function NavButton({ label, icon, onPress }: any) {
  return (
    <TouchableOpacity style={styles.navItem} onPress={onPress}>
      <Image source={icon} style={styles.navIconImage} />
      <Text style={styles.navText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0fdf4",
  },

  header: {
    backgroundColor: "#10b981",
    paddingTop: 55,
    paddingBottom: 25,
    alignItems: "center",
  },

  logo: {
    fontSize: 26,
    fontWeight: "900",
    color: "white",
    marginBottom: 15,
  },

  tabsContainer: {
    flexDirection: "row",
    gap: 35,
  },

  tabText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#d1fae5",
  },

  activeTab: {
    color: "white",
    borderBottomWidth: 3,
    borderColor: "white",
    paddingBottom: 4,
  },

  feedCard: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginVertical: 14,
    padding: 22,
    borderRadius: 22,
    elevation: 6,
    shadowColor: "#065f46",
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },

  cardAccent: {
    height: 4,
    width: 45,
    backgroundColor: "#10b981",
    borderRadius: 4,
    marginBottom: 15,
  },

  cardContentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  feedTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#065f46",
  },

  categoryText: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
  },

  statBox: {
    backgroundColor: "#d1fae5",
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 18,
    alignItems: "center",
  },

  statLabel: {
    fontSize: 11,
    color: "#065f46",
    opacity: 0.8,
  },

  statValue: {
    fontSize: 22,
    fontWeight: "900",
    color: "#065f46",
    marginTop: 4,
  },

  bottomNav: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 18,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },

  navItem: {
    alignItems: "center",
  },

  navIconImage: {
    width: 38,
    height: 38,
    resizeMode: "contain",
  },

  navText: {
    fontSize: 12,
    marginTop: 6,
    color: "#065f46",
    fontWeight: "600",
  },
});